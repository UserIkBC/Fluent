// Compila tools/src/{disc,mcc,open}_*.txt -> content/ls/more_{disc,mcc,open}.js
// disc : lvl ## frase ___ ## correcta|d1|d2|d3 ## expl.correcta // expl.d1 // expl.d2 // expl.d3 ## término=traducción; ...
// mcc  : === lvl ## título ## tema   (texto con [1]..[5], líneas en blanco = párrafos)
//        1: correcta|d1|d2|d3 ## why     ...     V: término=traducción; ...
// open : igual, pero  1: resp1/resp2 ## why
const fs=require('fs'),path=require('path');
const src=path.join(__dirname,'src'),out=path.join(__dirname,'..','content','ls');
const vparse=v=>v?v.split(';').map(z=>z.split('=').map(y=>y.trim())).filter(z=>z[0]&&z[1]):null;
const files=t=>fs.readdirSync(src).filter(f=>new RegExp('^'+t+'_.*\\.txt$').test(f)).sort();
const emit=(t,items,hdr)=>{fs.writeFileSync(path.join(out,'more_'+t+'.js'),'/* Generado por tools/build_ls.js desde tools/src/'+t+'_*.txt */\nwindow.LSR = window.LSR || {};\nLSR.'+t+' = (LSR.'+t+' || []).concat('+JSON.stringify(items).replace(/\},\{/g,'},\n{')+');\n');console.log(t,items.length);};
// disc
{const items=[];for(const f of files('disc')){const tag=f.replace(/^disc_|\.txt$/g,'');let n=0;
  for(const raw of fs.readFileSync(path.join(src,f),'utf8').split('\n')){const line=raw.trim();if(!line||line[0]==='#')continue;
    const p=line.split(' ## ');if(p.length<4)throw new Error(f+': línea corta: '+line.slice(0,60));
    const [lvl,s,o,e,v]=p;const opts=o.split('|').map(x=>x.trim());const ex=e.split(' // ').map(x=>x.trim());
    if(opts.length!==4||ex.length!==4)throw new Error(f+': opts/ex != 4: '+s.slice(0,60));
    const it={id:'d'+tag+String(++n).padStart(3,'0'),lvl,s:s.trim(),opts,a:0,ex};const vv=vparse(v);if(vv&&vv.length)it.v=vv;items.push(it);}}
  emit('disc',items);}
// mcc / open
for(const t of ['mcc','open']){const items=[];
  for(const f of files(t)){const tag=f.replace(new RegExp('^'+t+'_|\\.txt$','g'),'');let n=0;
    const blocks=fs.readFileSync(path.join(src,f),'utf8').split(/^=== /m).slice(1);
    for(const b of blocks){const lines=b.split('\n');const [lvl,title,topic]=lines[0].split(' ## ').map(x=>x.trim());
      const textL=[],gaps=[];let v=null;
      for(const l of lines.slice(1)){const m=l.match(/^([1-5]): (.*)$/);
        if(m){const [a,why]=m[2].split(' ## ');if(t==='mcc'){const o=a.split('|').map(x=>x.trim());gaps.push({opts:o,a:0,why:why.trim()});}
          else gaps.push({a:a.split('/').map(x=>x.trim()),why:why.trim()});}
        else if(/^V: /.test(l))v=vparse(l.slice(3));
        else if(!gaps.length)textL.push(l);}
      const text=textL.join('\n').trim().replace(/\n\n+/g,'\n\n');
      const it={id:(t==='mcc'?'m':'o')+tag+String(++n).padStart(3,'0'),lvl,title,topic,text,gaps};if(v&&v.length)it.v=v;items.push(it);}}
  emit(t,items);}
