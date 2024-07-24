const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { marpCli } = require('@marp-team/marp-cli');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3005;

// セキュリティヘッダーを設定
app.use(helmet());

// レート制限を設定
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // IPアドレスごとに100リクエスト
});
app.use(limiter);

// CORSを設定（本番環境では特定のオリジンのみを許可）
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
}));

app.use(express.json({ limit: '1mb' })); // JSONボディサイズを制限

// カスタムCSSファイルのパス
const customCssPath = path.join(__dirname, "custom.css");

const generateFile = async (markdown, format, res) => {
  try {
    // 一時ファイルの作成
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'marp-'));
    const inputFile = path.join(tempDir, 'input.md');
    const outputFile = path.join(tempDir, `output.${format}`);

    await fs.writeFile(inputFile, markdown);

    // marp-cliを使用してファイルを生成
    const cliOptions = [
      inputFile,
      '--output',
      outputFile,
      '--theme',
      customCssPath,
      `--${format}`
    ];
    await marpCli(cliOptions);

    const fileContent = await fs.readFile(outputFile);

    // クリーンアップ
    await Promise.all([
      fs.unlink(inputFile),
      fs.unlink(outputFile)
    ]);
    await fs.rmdir(tempDir);

    res.setHeader('Content-Type', format === 'html' ? 'text/html' : format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename=marp-slide.${format}`);
    res.send(fileContent);
  } catch (error) {
    console.error(`Error generating ${format.toUpperCase()}:`, error);
    res.status(500).json({ error: `Error generating ${format.toUpperCase()}: ${error.message}` });
  }
};

app.post('/:format(html|pdf|pptx)', async (req, res) => {
  const { markdown } = req.body;
  const { format } = req.params;

  if (!markdown) {
    return res.status(400).json({ error: 'Markdown content is required' });
  }

  await generateFile(markdown, format, res);
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});