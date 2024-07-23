const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { marpCli } = require('@marp-team/marp-cli');
const cors = require('cors');  // cors モジュールを追加

const app = express();
const port = 3005;

// CORSミドルウェアを追加
app.use(cors());

// カスタムCSSファイルのパス
const customCssPath = path.join(__dirname, "custom.css");

app.use(express.json()); // JSON リクエストボディのパース

app.post("/convert", async (req, res) => {
  try {
    const { markdown } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: "Markdown content is required" });
    }

    // 一時ファイルの作成
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "marp-"));
    const inputFile = path.join(tempDir, "input.md");
    const outputFile = path.join(tempDir, "output.html");

    // Markdownを一時ファイルに書き込む
    await fs.writeFile(inputFile, markdown);

    // marp-cliを使用してHTMLを生成
    const cliOptions = [
      inputFile,
      "--output",
      outputFile,
      "--theme",
      customCssPath,
      "--html"
    ];
    await marpCli(cliOptions);

    // 生成されたファイルを読み込む
    const html = await fs.readFile(outputFile, "utf-8");

    // 一時ファイルとディレクトリの削除
    await fs.unlink(inputFile);
    await fs.unlink(outputFile);
    await fs.rmdir(tempDir);

    // HTMLをダウンロード
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", "attachment; filename=marp-slide.html");
    res.send(html);
  } catch (error) {
    console.error("Error generating HTML:", error);
    res.status(500).json({ error: "Error generating HTML", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});