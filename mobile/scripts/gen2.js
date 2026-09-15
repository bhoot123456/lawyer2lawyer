const fs=require('fs'),path=require('path'),pngjs=require('pngjs'),P=pngjs.PNG,S=128;
const O=path.join(__dirname,'..','assets','images','dashboard');
function mk(){const p=new P({width:S,height:S});for(let i=0;i<p.data.length;i+=4){p.data[i]=15;p.data[i+1]=23;p.data[i+2]=42;p.data[i+3]=255}return p}
function px(p,x,y,r,g,b){if(x<0||x>=S||y<0||y>=S)return;const i=(S*y+x)*4;p.data[i]=r;p.data[i+1]=g;p.data[i+2]=b;p.data[i+3]=255}
function fr(p,x,y,w,h,r,g,b){for(let iy=y;iy<y+h;iy++)for(let ix=x;ix<x+w;ix++)px(p,ix,iy,r,g,b)}
function sr(p,x,y,w,h,r,g,b){for(let ix=x;ix<x+w;ix++){px(p,ix,y,r,g,b);px(p,ix,y+h-1,r,g,b)}for(let iy=y;iy<y+h;iy++){px(p,x,iy,r,g,b);px(p,x+w-1,iy,r,g,b)}}
function fc(p,cx,cy,r,cr,cg,cb){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)px(p,x,y,cr,cg,cb)}
function sc(p,cx,cy,r,cr,cg,cb){let x=r,y=0,e=1-x;while(x>=y){px(p,cx+x,cy+y,cr,cg,cb);px(p,cx-x,cy+y,cr,cg,cb);px(p,cx+x,cy-y,cr,cg,cb);px(p,cx-x,cy-y,cr,cg,cb);px(p,cx+y,cy+x,cr,cg,cb);px(p,cx-y,cy+x,cr,cg,cb);px(p,cx+y,cy-x,cr,cg,cb);px(p,cx-y,cy-x,cr,cg,cb);y++;if(e<0){e+=2*y+1}else{x--;e+=2*(y-x)+1}}}
function ln(p,x0,y0,x1,y1,r,g,b){const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx-dy;while(true){px(p,x0,y0,r,g,b);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>-dy){e-=dy;x0+=sx}if(e2<dx){e+=dx;y0+=sy}}}
function sv(p,n){fs.writeFileSync(path.join(O,n),P.sync.write(p))}
let c=0;
// ai-assistant
let p=mk();
for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;const x0=64+38*Math.cos(a),y0=64+38*Math.sin(a);const a2=(Math.PI/3)*((i+1)%6)-Math.PI/6;const x1=64+38*Math.cos(a2),y1=64+38*Math.sin(a2);ln(p,x0,y0,x1,y1,212,175,55)}
const nd=[[49,52],[79,52],[64,64],[46,74],[82,74],[64,82]];
for(let i=0;i<nd.length;i++)for(let j=i+1;j<nd.length;j++)ln(p,nd[i][0],nd[i][1],nd[j][0],nd[j][1],212,175,55);
for(const [nx,ny] of nd){fc(p,nx,ny,4,248,250,252);sc(p,nx,ny,4,212,175,55)}
sv(p,'ai-assistant.png');c++;
// court-diary
p=mk();fr(p,24,28,80,72,27,38,56);sr(p,24,28,80,72,212,175,55);ln(p,64,28,64,100,212,175,55);
for(let i=0;i<5;i++){ln(p,32,42+i*12,58,42+i*12,184,148,42);ln(p,70,42+i*12,96,42+i*12,184,148,42)}
for(let r=0;r<3;r++)for(let z=0;z<3;z++)sr(p,72+z*7,44+r*7,6,6,212,175,55);
sv(p,'court-diary.png');c++;
// draft-library
p=mk();for(let i=0;i<3;i++){const o=i*6;fr(p,28+o,24+o,68,80,27,38,56);sr(p,28+o,24+o,68,80,184,148,42)}
for(let i=0;i<4;i++)ln(p,40,44+i*12,88,44+i*12,212,175,55);ln(p,92,30,78,70,248,250,252);
sv(p,'draft-library.png');c++;
// bare-acts
p=mk();fr(p,28,24,72,80,27,38,56);sr(p,28,24,72,80,212,175,55);ln(p,64,38,80,54,248,250,252);fr(p,74,48,18,10,212,175,55);
for(let i=0;i<3;i++)ln(p,38,70+i*10,96,70+i*10,184,148,42);
sv(p,'bare-acts.png');c++;
// search
p=mk();sc(p,56,56,26,212,175,55);fc(p,56,56,22,212,175,55);ln(p,76,76,92,92,212,175,55);fr(p,36,50,52,40,27,38,56);
for(let i=0;i<3;i++)ln(p,42,60+i*10,82,60+i*10,184,148,42);
sv(p,'search.png');c++;
// hearings
p=mk();sc(p,64,64,36,212,175,55);fc(p,64,64,32,27,38,56);
for(let i=0;i<12;i++){const a=(Math.PI/6)*i;ln(p,64+26*Math.sin(a),64-26*Math.cos(a),64+32*Math.sin(a),64-32*Math.cos(a),212,175,55)}
ln(p,64,64,64,48,248,250,252);ln(p,64,64,82,56,248,250,252);fc(p,64,64,3,212,175,55);
sv(p,'hearings.png');c++;
// active-cases
p=mk();fr(p,28,40,72,52,27,38,56);sr(p,28,40,72,52,212,175,55);
ln(p,48,40,48,28,212,175,55);ln(p,80,40,80,28,212,175,55);ln(p,48,28,80,28,212,175,55);
fr(p,60,52,8,6,212,175,55);fc(p,92,36,6,212,175,55);
sv(p,'active-cases.png');c++;
// pending-cases
p=mk();ln(p,44,30,84,30,212,175,55);ln(p,44,98,84,98,212,175,55);
ln(p,44,30,64,60,212,175,55);ln(p,84,30,64,60,212,175,55);
ln(p,44,98,64,68,212,175,55);ln(p,84,98,64,68,212,175,55);
fr(p,52,40,24,16,212,175,55);fr(p,54,84,20,8,212,175,55);
sv(p,'pending-cases.png');c++;
// revenue
p=mk();fc(p,64,64,32,212,175,55);sc(p,64,64,32,248,250,252);sc(p,64,64,26,184,148,42);
ln(p,56,52,68,52,15,23,42);ln(p,68,52,56,64,15,23,42);
ln(p,56,64,72,64,15,23,42);ln(p,62,64,68,72,15,23,42);ln(p,68,72,60,78,15,23,42);
sv(p,'revenue.png');c++;
// client-meetings
p=mk();fc(p,64,50,12,212,175,55);fr(p,48,62,32,20,212,175,55);
fc(p,36,58,9,184,148,42);fr(p,26,67,20,15,184,148,42);
fc(p,92,58,9,184,148,42);fr(p,82,67,20,15,184,148,42);
sv(p,'client-meetings.png');c++;
// notifications
p=mk();fc(p,64,60,26,212,175,55);ln(p,40,68,88,68,212,175,55);
ln(p,64,68,64,88,212,175,55);fc(p,64,90,4,248,250,252);fc(p,64,34,4,212,175,55);sc(p,64,60,32,184,148,42);
sv(p,'notifications.png');c++;
// holidays
p=mk();fr(p,28,24,72,80,27,38,56);sr(p,28,24,72,80,212,175,55);
sc(p,44,20,4,212,175,55);sc(p,64,20,4,212,175,55);sc(p,84,20,4,212,175,55);
for(let r=0;r<4;r++)for(let z=0;z<5;z++)sr(p,34+z*12,36+r*16,10,12,212,175,55);
fr(p,58,52,10,12,212,175,55);
sv(p,'holidays.png');c++;
// cause-list
p=mk();fr(p,28,20,72,88,27,38,56);sr(p,28,20,72,88,212,175,55);
for(let i=0;i<5;i++){const y=32+i*15;fc(p,40,y+4,5,212,175,55);ln(p,50,y+4,96,y+4,184,148,42)}
sc(p,88,90,10,184,148,42);
sv(p,'cause-list.png');c++;
// legal-news
p=mk();fr(p,24,24,80,80,27,38,56);sr(p,24,24,80,80,212,175,55);fr(p,30,30,68,12,212,175,55);
for(let z=0;z<3;z++){const cx=32+z*22;for(let r=0;r<4;r++)ln(p,cx,52+r*14,cx+16,52+r*14,184,148,42)}
sv(p,'legal-news.png');c++;
// calendar
p=mk();fr(p,20,24,88,80,27,38,56);sr(p,20,24,88,80,212,175,55);fr(p,20,24,88,20,212,175,55);
for(let r=0;r<4;r++)for(let z=0;z<5;z++)sr(p,26+z*14,52+r*14,12,12,212,175,55);
fr(p,54,66,12,12,248,250,252);
sv(p,'calendar.png');c++;
// time
p=mk();sc(p,64,64,38,212,175,55);fc(p,64,64,34,27,38,56);
for(let i=0;i<12;i++){const a=(Math.PI/6)*i;const m=i%3===0;ln(p,64+(m?24:28)*Math.sin(a),64-(m?24:28)*Math.cos(a),64+34*Math.sin(a),64-34*Math.cos(a),212,175,55)}
ln(p,64,64,64,46,248,250,252);ln(p,64,64,78,74,248,250,252);fc(p,64,64,3,212,175,55);
sv(p,'time.png');c++;
console.log('Generated '+c+' more assets');
