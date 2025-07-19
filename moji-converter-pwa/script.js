/* === ひらがな ⇄ カタカナ === */
function hiraToKata(str) {
  return str.replace(/[\u3041-\u3096]/g, c =>
    String.fromCharCode(c.charCodeAt(0) + 0x60)
  );
}
function kataToHira(str) {
  return str.replace(/[\u30A1-\u30F6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

/* === 半角カナ → 全角カナ対応テーブル === */
const kanaMap = {
  'ｶﾞ':'ガ','ｷﾞ':'ギ','ｸﾞ':'グ','ｹﾞ':'ゲ','ｺﾞ':'ゴ',
  'ｻﾞ':'ザ','ｼﾞ':'ジ','ｽﾞ':'ズ','ｾﾞ':'ゼ','ｿﾞ':'ゾ',
  'ﾀﾞ':'ダ','ﾁﾞ':'ヂ','ﾂﾞ':'ヅ','ﾃﾞ':'デ','ﾄﾞ':'ド',
  'ﾊﾞ':'バ','ﾋﾞ':'ビ','ﾌﾞ':'ブ','ﾍﾞ':'ベ','ﾎﾞ':'ボ',
  'ﾊﾟ':'パ','ﾋﾟ':'ピ','ﾌﾟ':'プ','ﾍﾟ':'ペ','ﾎﾟ':'ポ',
  'ｳﾞ':'ヴ','ﾜﾞ':'ヷ','ｦﾞ':'ヺ',
  'ｱ':'ア','ｲ':'イ','ｳ':'ウ','ｴ':'エ','ｵ':'オ',
  'ｶ':'カ','ｷ':'キ','ｸ':'ク','ｹ':'ケ','ｺ':'コ',
  'ｻ':'サ','ｼ':'シ','ｽ':'ス','ｾ':'セ','ｿ':'ソ',
  'ﾀ':'タ','ﾁ':'チ','ﾂ':'ツ','ﾃ':'テ','ﾄ':'ト',
  'ﾅ':'ナ','ﾆ':'ニ','ﾇ':'ヌ','ﾈ':'ネ','ﾉ':'ノ',
  'ﾊ':'ハ','ﾋ':'ヒ','ﾌ':'フ','ﾍ':'ヘ','ﾎ':'ホ',
  'ﾏ':'マ','ﾐ':'ミ','ﾑ':'ム','ﾒ':'メ','ﾓ':'モ',
  'ﾔ':'ヤ','ﾕ':'ユ','ﾖ':'ヨ',
  'ﾗ':'ラ','ﾘ':'リ','ﾙ':'ル','ﾚ':'レ','ﾛ':'ロ',
  'ﾜ':'ワ','ｦ':'ヲ','ﾝ':'ン',
  'ｧ':'ァ','ｨ':'ィ','ｩ':'ゥ','ｪ':'ェ','ｫ':'ォ',
  'ｯ':'ッ','ｬ':'ャ','ｭ':'ュ','ｮ':'ョ',
  '｡':'。','｢':'「','｣':'」','､':'、','･':'・'
};

function toZenkaku(str) {
  Object.keys(kanaMap).forEach(k => {
    str = str.replace(new RegExp(k, 'g'), kanaMap[k]);
  });
  return str.replace(/[ -~]/g, c =>
    String.fromCharCode(c.charCodeAt(0) + 0xFEE0)
  );
}

function toHankaku(str) {
  str = str.replace(/[！-～]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
  );
  const reverseKana = Object.fromEntries(
    Object.entries(kanaMap).map(([k,v]) => [v,k])
  );
  Object.keys(reverseKana).forEach(k => {
    str = str.replace(new RegExp(k, 'g'), reverseKana[k]);
  });
  return str;
}

/* === 自動判定 === */
function autoConvert(str) {
  const hira = (str.match(/[\u3041-\u3096]/g) || []).length;
  const kata = (str.match(/[\u30A1-\u30FA]/g) || []).length;
  const hankaku = (str.match(/[ -~]/g) || []).length;
  const zenkaku = (str.match(/[！-～]/g) || []).length;
  if (!str) return '';
  if (hira >= kata && hira > 0) return hiraToKata(str);
  if (kata > hira) return kataToHira(str);
  return hankaku >= zenkaku ? toZenkaku(str) : toHankaku(str);
}

/* === DOM & 操作 === */
const $ = sel => document.getElementById(sel);
const input  = $('input');
const output = $('output');
const live   = $('live');

$('hiraToKata').onclick = () => output.value = hiraToKata(input.value);
$('kataToHira').onclick = () => output.value = kataToHira(input.value);
$('toZenkaku').onclick = () => output.value = toZenkaku(input.value);
$('toHankaku').onclick = () => output.value = toHankaku(input.value);
$('auto').onclick = () => output.value = autoConvert(input.value);

$('swap').onclick = () => {
  [input.value, output.value] = [output.value, input.value];
  if (live.checked) output.value = autoConvert(input.value);
};
$('clear').onclick = () => { input.value=''; output.value=''; input.focus(); };
$('copy').onclick = () => {
  if (!output.value) return;
  navigator.clipboard.writeText(output.value).then(()=>{
    flash('コピーしました');
  });
};

input.addEventListener('input', () => {
  if (live && live.checked) output.value = autoConvert(input.value);
});

function flash(msg){
  let div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  document.body.appendChild(div);
  requestAnimationFrame(()=>{
    div.style.opacity='1';
    div.style.transform='translate(-50%,0)';
  });
  setTimeout(()=>{
    div.style.opacity='0';
    div.style.transform='translate(-50%,10px)';
    setTimeout(()=>div.remove(),300);
  },1200);
}

// シンプルなトースト用スタイル挿入
const toastStyle = document.createElement('style');
toastStyle.textContent = `
.toast{
  position:fixed;
  left:50%;bottom:calc(env(safe-area-inset-bottom,0) + 20px);
  background:#3b82f6;
  color:#fff;
  padding:.55rem .9rem;
  border-radius:24px;
  font-size:.75rem;
  letter-spacing:.5px;
  opacity:0;
  transform:translate(-50%,10px);
  transition:.25s;
  box-shadow:0 6px 18px -6px #000c;
  z-index:1000;
}`;
document.head.appendChild(toastStyle);

input.focus();
