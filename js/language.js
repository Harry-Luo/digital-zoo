// ============ 多语言 i18n ============
let currentLang = 'zh';

const i18n = {
    zh: {
        title: '动物园数字孪生系统', subtitle: '点击动物查看详情 · 拖拽旋转视角',
        hint: '左键拖拽旋转 · 右键拖拽平移 · 滚轮缩放',
        loading: '正在加载动物园...', loadingModel: '正在加载模型...',
        perspective:'透视视角', bird:'鸟瞰视角', daynight:'昼夜切换', weather:'天气切换', reset:'重置视角',
        labelScientific:'学名', labelHabitat:'栖息地', labelDescription:'介绍', lang:'语言切换',
        animals: {
            lion: { name:'非洲狮', scientific:'Panthera leo', habitat:'非洲草原、稀树草原', description:'非洲狮是大型猫科动物，被誉为"丛林之王"。它们是群居动物，通常以家族形式生活。雄狮有浓密的鬃毛，体型比雌狮更大。' },
            elephant: { name:'非洲象', scientific:'Loxodonta africana', habitat:'非洲热带草原、森林', description:'非洲象是陆地上最大的哺乳动物。它们拥有发达的象牙和灵活的鼻子，性格温顺，是高度社会化的动物。' },
            giraffe: { name:'长颈鹿', scientific:'Giraffa camelopardalis', habitat:'非洲稀树草原', description:'长颈鹿是陆地上最高的动物，成年个体身高可达5-6米。它们以树叶为食，拥有修长的脖子和独特的斑纹。' },
            zebra: { name:'斑马', scientific:'Equus quagga', habitat:'非洲草原', description:'斑马以其独特的黑白条纹闻名。每只斑马的条纹图案都是独一无二的。它们是群居动物，喜欢与同伴在一起。' },
            panda: { name:'大熊猫', scientific:'Ailuropoda melanoleuca', habitat:'中国四川、陕西、甘肃的竹林', description:'大熊猫是中国特有的珍稀动物，被誉为"活化石"。它们主要以竹子为食，性格温顺，深受世界各国人民喜爱。' }
        }
    },
    en: {
        title: 'Zoo Digital Twin System', subtitle: 'Click animals for details · Drag to rotate',
        hint: 'Left drag:rotate · Right drag:pan · Scroll:zoom',
        loading: 'Loading the zoo...', loadingModel: 'Loading models...',
        perspective:'Perspective', bird:'Bird View', daynight:'Day/Night', weather:'Weather', reset:'Reset View',
        labelScientific: 'Scientific Name', labelHabitat: 'Habitat', labelDescription: 'Description', lang: 'Language',
        animals: {
            lion: { name:'African Lion', scientific:'Panthera leo', habitat:'African savanna', description:'The African lion is a large cat known as the "King of the Jungle". They live in prides.' },
            elephant: { name:'African Elephant', scientific:'Loxodonta africana', habitat:'African grasslands, forests', description:'The African elephant is the largest land mammal, with tusks and a flexible trunk.' },
            giraffe: { name:'Giraffe', scientific:'Giraffa camelopardalis', habitat:'African savanna', description:'The tallest land animal, reaching 5-6 meters, feeding on leaves with long necks.' },
            zebra: { name:'Zebra', scientific:'Equus quagga', habitat:'African grasslands', description:'Known for distinctive black-and-white stripes unique to each individual.' },
            panda: { name:'Giant Panda', scientific:'Ailuropoda melanoleuca', habitat:'Bamboo forests of Sichuan, China', description:'A rare animal native to China, known as a "living fossil", mainly eating bamboo.' }
        }
    }
};

function t(k)  { return i18n[currentLang][k]; }
function tA(k) { return i18n[currentLang].animals[k]; }

function updateAllUI() {
    var d = document.querySelector('.title-bar h1'); if (d) d.textContent = t('title');
    d = document.querySelector('.title-bar p'); if (d) d.textContent = t('subtitle');
    d = document.querySelector('.hint-text'); if (d) d.textContent = t('hint');
    d = document.querySelector('#loading p'); if (d) d.textContent = t('loading');
    document.querySelectorAll('.control-label[data-lbl]').forEach(function(lbl) {
        lbl.textContent = t(lbl.getAttribute('data-lbl'));
    });
    var il = document.querySelectorAll('.info-item label');
    if (il[0]) il[0].textContent = t('labelScientific');
    if (il[1]) il[1].textContent = t('labelHabitat');
    if (il[2]) il[2].textContent = t('labelDescription');
    var lb = document.getElementById('lang-toggle');
    if (lb) lb.textContent = currentLang === 'zh' ? 'EN' : '中';
}

function setLang(v) { currentLang = v; }
export { currentLang, setLang, t, tA, updateAllUI };
