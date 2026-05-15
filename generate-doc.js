const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const files = [
    { name: 'index.html', title: '入口页面 (HTML+CSS)' },
    { name: 'js/main.js', title: '主入口 (main.js)' },
    { name: 'js/config.js', title: '配置文件 (config.js)' },
    { name: 'js/language.js', title: '多语言 (language.js)' },
    { name: 'js/utils.js', title: '工具函数 (utils.js)' },
    { name: 'js/scene.js', title: '场景创建 (scene.js)' },
    { name: 'js/animals.js', title: '动物创建 (animals.js)' },
    { name: 'js/vegetation.js', title: '植被创建 (vegetation.js)' },
    { name: 'js/weather.js', title: '天气系统 (weather.js)' },
    { name: 'js/effects.js', title: '动画特效 (effects.js)' },
    { name: 'js/interaction.js', title: '交互逻辑 (interaction.js)' },
    { name: 'js/minimap.js', title: '小地图 (minimap.js)' },
];

const children = [];

// Title
children.push(new Paragraph({
    text: '动物园数字孪生交互系统 - 源代码',
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
}));
children.push(new Paragraph({
    text: '基于 Three.js r179 的浏览器端 3D 虚拟动物园',
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
}));

for (const file of files) {
    const filePath = path.join(__dirname, file.name);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // File title as heading
    children.push(new Paragraph({
        text: file.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 100 },
    }));
    children.push(new Paragraph({
        text: `文件路径: ${file.name}  (${lines.length} 行)`,
        spacing: { after: 200 },
        style: 'Normal',
        children: [
            new TextRun({ text: `文件路径: ${file.name}  (${lines.length} 行)`, italics: true, size: 20, color: '666666' }),
        ],
    }));

    // Code lines
    for (let i = 0; i < lines.length; i++) {
        children.push(new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [
                new TextRun({
                    text: lines[i] || ' ',
                    font: 'Consolas',
                    size: 16,
                }),
            ],
        }));
    }
}

const doc = new Document({
    styles: {
        default: {
            document: {
                run: {
                    font: 'Microsoft YaHei',
                    size: 20,
                },
            },
        },
    },
    sections: [{ children }],
});

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(path.join(__dirname, '动物园源代码.docx'), buffer);
    console.log('Word document generated: 动物园源代码.docx');
    console.log('Files included:', files.length);
});
