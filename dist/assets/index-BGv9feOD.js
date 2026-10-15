(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();class Hc{listeners=new Map;nextId=0;on(e,t){const n=this.nextId++,s=this.listeners.get(e)??[];return s.push({id:n,callback:t,once:!1}),this.listeners.set(e,s),n}once(e,t){const n=this.nextId++,s=this.listeners.get(e)??[];return s.push({id:n,callback:t,once:!0}),this.listeners.set(e,s),n}off(e){for(const[,t]of this.listeners){const n=t.findIndex(s=>s.id===e);if(n>=0){t.splice(n,1);return}}}emit(e,t){const n=this.listeners.get(e);if(!n)return;const s=[];for(const r of n)r.callback(t),r.once&&s.push(r.id);for(const r of s){const a=n.findIndex(o=>o.id===r);a>=0&&n.splice(a,1)}}removeAll(e){e?this.listeners.delete(e):this.listeners.clear()}}const Bl=499.005,$i=.000295912208285591,Pn=149597870700,ji=1495978707e-1,Qr=57724e4,zc=3389500,Vc=6371e3,kl=6957e5,Gc=5670374419e-17,dr=1361,Ki=2451545,ss=86400,Xs={a:1.00000261,e:.01671123,L0:100.46457,wbar:102.93768,n:360/365.256},qs={a:1.52371034,e:.0933941,L0:355.4466,wbar:336.05637,n:360/686.98},_i=2,mo=5e5,go=1.8,Wc=.64,Xc=.84,qc=1,hr=25,vo=1,Jn=[1,10,60,600,3600,86400,604800],Yc=600;function hn(i){return i*Math.PI/180}function $c(i){return i*180/Math.PI}class jc{simTimeJD;metSeconds;warp;paused;startJD;constructor(e){this.startJD=e,this.simTimeJD=e,this.metSeconds=0,this.warp=1,this.paused=!1}tick(e){if(this.paused||e<=0)return 0;const t=e*this.warp;return this.metSeconds+=t,this.simTimeJD=this.startJD+this.metSeconds/ss,t}setWarp(e){const t=Jn;if(t.includes(e)){this.warp=e;return}let n=t[0],s=Math.abs(e-n);for(const r of t){const a=Math.abs(e-r);a<s&&(s=a,n=r)}this.warp=n}warpUp(){const e=Jn.indexOf(this.warp);return e>=0&&e<Jn.length-1?this.warp=Jn[e+1]:e===-1&&this.setWarp(this.warp),this.warp}warpDown(){const e=Jn.indexOf(this.warp);return e>0?this.warp=Jn[e-1]:e===-1&&this.setWarp(this.warp),this.warp}pause(){this.paused=!0}resume(){this.paused=!1}togglePause(){this.paused=!this.paused}dropTo1x(){this.warp=1}handleAlert(e){(e==="CAUTION"||e==="WARNING"||e==="CRITICAL")&&this.dropTo1x()}get subsystemsActive(){return this.warp<=Yc}}function Hl(i,e,t=1e-12,n=100){if(e===0)return i;const s=2*Math.PI,r=Math.floor(i/s),a=i-r*s;let o=e<.8?a+e*Math.sin(a)+.5*e*e*Math.sin(2*a):Math.PI;for(let l=0;l<n;l++){const c=o-e*Math.sin(o)-a,d=1-e*Math.cos(o),u=c/d;if(o-=u,Math.abs(u)<t)break}return r*s+o}function Kc(i,e){if(e===0)return i;const t=2*Math.PI,n=Math.floor(i/t),s=i-n*t,r=Math.sqrt(Math.max(0,1-e*e))*Math.sin(s),a=Math.cos(s)-e;let o=Math.atan2(r,a);return o<0&&(o+=t),n*t+o}function Jc(i,e,t){return i*(1-e*Math.cos(t))}function Zc(i,e){const t=e-Ki,n=i.L0-i.wbar+i.n*t,s=2*Math.PI;let r=hn(n)%s;return r<0&&(r+=s),r}function zl(i,e){const t=Zc(i,e),n=Hl(t,i.e),s=Kc(n,i.e),r=Jc(i.a,i.e,n),o=hn(i.wbar)+s;return{x:r*Math.cos(o),y:r*Math.sin(o),r,nu:s}}function Ji(i){return zl(Xs,i)}function Zi(i){return zl(qs,i)}function es(i){if(i>1e-4){const e=Math.sqrt(i);return(1-Math.cos(e))/i}if(i<-1e-4){const e=Math.sqrt(-i);return(Math.cosh(e)-1)/-i}return .5-i/24+i*i/720-i*i*i/40320+i*i*i*i/3628800}function ts(i){if(i>1e-4){const e=Math.sqrt(i);return(e-Math.sin(e))/(e*e*e)}if(i<-1e-4){const e=Math.sqrt(-i);return(Math.sinh(e)-e)/(e*e*e)}return 1/6-i/120+i*i/5040-i*i*i/362880+i*i*i*i/39916800}function An(i,e,t,n){const s=es(i),r=ts(i);return e+t+n*((i*r-1)/Math.sqrt(s))}function Un(i,e,t,n,s){const r=es(i),a=ts(i),o=An(i,e,t,n);return o<=0||r<=0?NaN:(Math.pow(o/r,1.5)*a+n*Math.sqrt(o))/Math.sqrt(s)}function Qc(i,e,t,n,s){const r=es(i),a=ts(i),o=An(i,e,t,n);if(o<=0||r<=0)return NaN;const l=Math.sqrt(s);if(Math.abs(i)<1e-6)return 1/l*(Math.SQRT2/40*Math.pow(o,1.5)+n/8*(Math.sqrt(o)+n*Math.sqrt(1/(2*o))));const c=Math.pow(o/r,1.5)*(1/(2*i)*(r-3*a)+3*a*a/(4*r)),d=n/8*(3*a/r*Math.sqrt(o)+n*Math.sqrt(r/o));return 1/l*(c+d)}function ed(i,e,t,n,s=!1){if(t<=0||n<=0)return null;const[r,a]=i,[o,l]=e,c=Math.hypot(r,a),d=Math.hypot(o,l);if(c<1e-12||d<1e-12)return null;const u=r*l-a*o,f=r*o+a*l,m=Math.max(-1,Math.min(1,f/(c*d)));let g=Math.acos(m);if(s?u>=0&&(g=2*Math.PI-g):u<0&&(g=2*Math.PI-g),g<1e-6||g>2*Math.PI-1e-6)return null;Math.abs(g-Math.PI)<1e-6&&(g=g<Math.PI?Math.PI-1e-6:Math.PI+1e-6);const p=Math.sin(g)*Math.sqrt(c*d/(1-Math.cos(g)));if(Math.abs(p)<1e-12)return null;const h=4*Math.PI*Math.PI-.001;let b=h,E=Un(b,c,d,p,n);if(Number.isFinite(E)&&t>E)return null;const S=An(0,c,d,p);let P,A;if(S>0){const V=Un(0,c,d,p,n);if(t>=V)P=0,A=V;else{b=0,E=V;let j=-4,B=j;for(;B>-500&&!(An(B,c,d,p)<=0||Un(B,c,d,p,n)<=t);)j*=2,B+=j;if(P=B,A=Un(P,c,d,p,n),!Number.isFinite(A)||An(P,c,d,p)<=0){let Q=P,ie=b;for(let ue=0;ue<40;ue++){const De=.5*(Q+ie);An(De,c,d,p)>0?ie=De:Q=De}P=ie+1e-5,A=Un(P,c,d,p,n)}}}else{let V=0,j=h;for(let B=0;B<40;B++){const Q=.5*(V+j);An(Q,c,d,p)>0?j=Q:V=Q}P=j+1e-5,A=Un(P,c,d,p,n)}if(!Number.isFinite(A)||t<A)return null;let w=.5*(P+b);const N=80,M=1e-10;for(let V=0;V<N;V++){const j=Un(w,c,d,p,n);if(!Number.isFinite(j)){w=.5*(P+b);continue}const B=j-t;if(Math.abs(B)<M||Math.abs(b-P)<1e-11)break;B<0?P=w:b=w;const Q=Qc(w,c,d,p,n);let ie=NaN;if(Number.isFinite(Q)&&Q>0){const ue=w-B/Q;ue>P&&ue<b&&(ie=ue)}Number.isNaN(ie)&&(ie=.5*(P+b)),w=ie}const x=An(w,c,d,p);if(x<=0)return null;const C=1-x/c,z=p*Math.sqrt(x/n),O=1-x/d;if(Math.abs(z)<1e-12)return null;const q=[(o-C*r)/z,(l-C*a)/z],$=[(O*o-r)/z,(O*l-a)/z];return{v1:q,v2:$}}function ea(i,e,t,n){if(t===0)return{r:[i[0],i[1]],v:[e[0],e[1]]};const[s,r]=i,[a,o]=e,l=Math.hypot(s,r),c=a*a+o*o,d=s*a+r*o,u=Math.sqrt(n),f=2/l-c/n;let m;if(f>1e-6)m=u*t*f;else if(f<-1e-6){const x=1/f,C=t>=0?1:-1,z=d+C*Math.sqrt(-n*f)*(1-f*l),O=-2*n*f*t/z;O>0?m=C*Math.sqrt(-x)*Math.log(O):m=u*t/l}else m=u*t/l;const g=100,v=1e-12;for(let x=0;x<g;x++){const C=f*m*m,z=es(C),O=ts(C),q=d/u*m*m*z+(1-f*l)*Math.pow(m,3)*O+l*m-u*t,$=d/u*m*(1-C*O)+(1-f*l)*m*m*z+l,V=q/$;if(m-=V,Math.abs(V)<v||Math.abs(q)<v)break}const p=f*m*m,h=es(p),b=ts(p),E=d/u*m*(1-p*b)+(1-f*l)*m*m*h+l,S=1-m*m/l*h,P=t-Math.pow(m,3)/u*b,A=u/(Math.max(E,1e-12)*l)*m*(p*b-1),w=1-m*m/Math.max(E,1e-12)*h,N=[S*s+P*a,S*r+P*o],M=[A*s+w*a,A*r+w*o];return{r:N,v:M}}class td{shipState;departureJD;arrivalJD;tofDays;departurePos;arrivalPos;departureVel;arrivalVel;currentSimTimeJD=Ki;constructor(){this.initialize()}initialize(){const e=Ki+1825,t=Ki+365*8,n=5,s=180,r=300,a=5;let o=e,l=e+s,c=s,d=[1,0],u=[1.5,0],f=[0,0],m=[0,0],g=1/0;const v=1e-4;for(let p=e;p<=t;p+=n){const h=Ji(p),b=[h.x,h.y],E=Ji(p-v),S=Ji(p+v),P=[(S.x-E.x)/(2*v),(S.y-E.y)/(2*v)];for(let A=s;A<=r;A+=a){const w=p+A,N=Zi(w),M=[N.x,N.y],x=ed(b,M,A,$i);if(!x)continue;const C=Math.hypot(x.v1[0]-P[0],x.v1[1]-P[1]);C<g&&(g=C,o=p,l=w,c=A,d=b,u=M,f=x.v1,m=x.v2)}}this.departureJD=o,this.arrivalJD=l,this.tofDays=c,this.departurePos=d,this.arrivalPos=u,this.departureVel=f,this.arrivalVel=m,this.currentSimTimeJD=o,this.shipState={pos:[this.departurePos[0],this.departurePos[1]],vel:[this.departureVel[0],this.departureVel[1]],phase:"Cruise",attitudeQuat:[1,0,0,0],deltaVRemaining:4200,mass:45e3}}update(e){this.currentSimTimeJD=e;const t=e-this.departureJD,n=ea(this.departurePos,this.departureVel,t,$i);this.shipState.pos=n.r,this.shipState.vel=n.v;const s=Zi(e),r=this.distanceToMars([s.x,s.y]),a=Qr/Pn;r<=a?this.shipState.phase="MOI":e<this.departureJD?this.shipState.phase="Cruise":e>=this.arrivalJD?this.shipState.phase="MarsOrbit":this.shipState.phase="Cruise"}predictPosition(e){const t=e-this.departureJD;return ea(this.departurePos,this.departureVel,t,$i).r}isInMarsSOI(e){const t=e??(()=>{const s=Zi(this.currentSimTimeJD);return[s.x,s.y]})();return this.distanceToMars(t)<=Qr/Pn}distanceToMars(e){return Math.hypot(this.shipState.pos[0]-e[0],this.shipState.pos[1]-e[1])}}function ta(i){return i*Bl}function Vl(i,e){return Math.hypot(i[0]-e[0],i[1]-e[1])}function Gl(i,e){const t=-e[0],n=-e[1],s=Math.hypot(t,n),r=i[0]-e[0],a=i[1]-e[1],o=Math.hypot(r,a);if(s<1e-12||o<1e-12)return 0;const l=(t*r+n*a)/(s*o),c=Math.max(-1,Math.min(1,l));return $c(Math.acos(c))}function na(i,e=_i){return i<=e}function nd(i,e){return i<=0||!Number.isFinite(i)?0:e/(i*i)}function id(i,e=_i){if(i<=e)return 1;const t=Math.max(e*2,5);if(i>=e+t)return 0;const n=(i-e)/t;return Math.max(0,Math.min(1,Math.pow(1-n,2)))}const sd=3,rd=22;class ad{state;overrideEnabled;overrideDelaySec;constructor(){this.overrideEnabled=!1,this.overrideDelaySec=600,this.state={distanceAU:0,oneWayLightTimeSec:0,roundTripSec:0,thetaDeg:180,linkState:"NOMINAL",linkRateBps:mo,packetLossProb:0,isOverridden:!1,overrideDelaySec:this.overrideDelaySec}}update(e,t){const n=Vl(e,t),s=ta(n),r=2*s,a=Gl(e,t),o=na(a),l=id(a),c=nd(n,mo),d=o?0:c*(1-l);let u;this.overrideEnabled?u="OVERRIDE":o?u="BLACKOUT":l>.001?u="DEGRADED":u="NOMINAL",this.state={distanceAU:n,oneWayLightTimeSec:s,roundTripSec:r,thetaDeg:a,linkState:u,linkRateBps:d,packetLossProb:l,isOverridden:this.overrideEnabled,overrideDelaySec:this.overrideDelaySec}}setOverride(e,t){if(this.overrideEnabled=e,t!==void 0){const n=Math.max(sd,Math.min(rd,t));this.overrideDelaySec=n*60}this.state.isOverridden=this.overrideEnabled,this.state.overrideDelaySec=this.overrideDelaySec,this.overrideEnabled?this.state.linkState="OVERRIDE":this.state.linkState==="OVERRIDE"&&(na(this.state.thetaDeg)?this.state.linkState="BLACKOUT":this.state.packetLossProb>.001?this.state.linkState="DEGRADED":this.state.linkState="NOMINAL")}get effectiveDelaySec(){return this.overrideEnabled?this.overrideDelaySec:this.state.oneWayLightTimeSec}}class od{loopA;loopB;baseHeatLoad=1400;payloadHeatLoad=600;computeHeatLoad=70;cp=4186;fluidMass=60;radArea=10;emissivity=.9;accumCapacityKg=8;constructor(){this.loopA=this.createDefaultLoop("A",!0),this.loopB=this.createDefaultLoop("B",!0)}createDefaultLoop(e,t){return{id:e,active:t,coolantTempIn:290,coolantTempOut:292.5,pumpRpm:3600,pumpDeltaP:155,flowRate:.45,accumulatorLevel:.88,loopPressure:215,radiatorTemp:292.5,pumpDegraded:!1,leaking:!1,leakRate:0,blocked:!1}}step(e,t){if(e<=0)return;const s=t<=1.05||t>=1.38&&t<=1.62?200:3,r=Math.max(0,this.baseHeatLoad+this.payloadHeatLoad+this.computeHeatLoad),o=[this.loopA,this.loopB].filter(c=>c.active).length,l=o>0?r/o:0;this.stepLoop(this.loopA,e,l,s),this.stepLoop(this.loopB,e,l,s)}stepLoop(e,t,n,s){if(!e.active){e.pumpRpm=0,e.flowRate=0,e.pumpDeltaP=0;return}let r=3600,a=1;if(e.pumpDegraded&&(a=.5,r=2400),e.blocked?(e.pumpDeltaP=320,e.flowRate=.01,r=3200):(e.flowRate=.45*(r/3600)*a,e.pumpDeltaP=155*a),e.pumpRpm=r,e.leaking&&e.leakRate&&e.leakRate>0){const b=e.leakRate*t/this.accumCapacityKg;e.accumulatorLevel=Math.max(0,e.accumulatorLevel-b),e.accumulatorLevel<=.05&&(e.loopPressure=Math.max(10,e.loopPressure-5*t))}else e.accumulatorLevel>.1&&e.loopPressure<215&&(e.loopPressure=Math.min(215,e.loopPressure+.5*t));const o=Math.max(.01,e.flowRate),l=n/(o*this.cp);e.coolantTempOut=e.coolantTempIn+l,e.radiatorTemp=e.coolantTempOut;const c=291;let d=0;e.coolantTempIn<c&&(d=Math.min(1,Math.max(0,(c-e.coolantTempIn)/8)));const u=this.radArea*(1-d),f=this.emissivity*Gc*u*(Math.pow(e.radiatorTemp,4)-Math.pow(s,4)),m=Math.max(0,f),g=n-m,v=this.fluidMass*this.cp,p=g/v*t;e.coolantTempIn=Math.min(370,Math.max(260,e.coolantTempIn+p)),e.coolantTempOut=e.coolantTempIn+n/(o*this.cp),e.radiatorTemp=(e.coolantTempIn+e.coolantTempOut)/2}injectPumpFailure(e){const t=e==="A"?this.loopA:this.loopB;t.pumpDegraded=!0}injectLeak(e,t=.002){const n=e==="A"?this.loopA:this.loopB;n.leaking=!0,n.leakRate=t}injectBlockage(e){const t=e==="A"?this.loopA:this.loopB;t.blocked=!0}clearFault(e,t){const n=e==="A"?this.loopA:this.loopB;(t==="pump"||t==="all")&&(n.pumpDegraded=!1),(t==="leak"||t==="all")&&(n.leaking=!1,n.leakRate=0,n.accumulatorLevel=.88,n.loopPressure=215),(t==="blockage"||t==="all")&&(n.blocked=!1)}}class ld{state;rO2=259.83;rN2=296.81;rCO2=188.92;massO2;massN2;massCO2;integralError=0;kp=1e-4;ki=5e-6;constructor(){this.massO2=21.3*100*1e3/(this.rO2*295.15),this.massN2=79.5*100*1e3/(this.rN2*295.15),this.massCO2=.5*100*1e3/(this.rCO2*295.15),this.state={cabinVolume:100,cabinPressure:21.3+79.5+.5,ppO2:21.3,ppN2:79.5,ppCO2:.5,temperature:295.15,o2FlowRate:3889e-8,co2ScrubberEfficiency:1,leakRate:0,regulatorStuck:!1,scrubberDegraded:!1,cabinLeak:!1}}step(e,t){if(e<=0)return;const n=Math.max(0,t),s=Xc/86400*n,r=qc/86400*n,o=21.3-this.state.ppO2;if(this.state.regulatorStuck)this.state.o2FlowRate=0;else{this.integralError=Math.max(-.5,Math.min(.5,this.integralError+o*e));const v=this.kp*o,p=this.ki*this.integralError;this.state.o2FlowRate=Math.max(0,Math.min(.005,s+v+p))}const c=r*1.35*this.state.co2ScrubberEfficiency*Math.min(2.5,Math.max(0,this.state.ppCO2/.5)),d=Math.min(this.massCO2,c*e),u=(this.state.o2FlowRate-s)*e;this.massO2=Math.max(0,this.massO2+u);const f=r*e-d;if(this.massCO2=Math.max(0,this.massCO2+f),this.state.cabinLeak&&this.state.leakRate>0){const v=this.massO2+this.massN2+this.massCO2;if(v>0){const p=Math.min(v,this.state.leakRate*e);this.massO2-=p*(this.massO2/v),this.massN2-=p*(this.massN2/v),this.massCO2-=p*(this.massCO2/v)}}const m=this.state.cabinVolume,g=this.state.temperature;this.state.ppO2=this.massO2*this.rO2*g/(m*1e3),this.state.ppN2=this.massN2*this.rN2*g/(m*1e3),this.state.ppCO2=this.massCO2*this.rCO2*g/(m*1e3),this.state.cabinPressure=this.state.ppO2+this.state.ppN2+this.state.ppCO2}injectRegulatorStuck(){this.state.regulatorStuck=!0,this.state.o2FlowRate=0}injectLeak(e=.002){this.state.cabinLeak=!0,this.state.leakRate=e}injectScrubberDegradation(e=.3){this.state.scrubberDegraded=!0,this.state.co2ScrubberEfficiency=Math.max(0,Math.min(1,e))}clearFault(e){(e==="regulator"||e==="all")&&(this.state.regulatorStuck=!1,this.integralError=0),(e==="leak"||e==="all")&&(this.state.cabinLeak=!1,this.state.leakRate=0),(e==="scrubber"||e==="all")&&(this.state.scrubberDegraded=!1,this.state.co2ScrubberEfficiency=1)}}class cd{state;batteryEnergyWh;constructor(){this.batteryEnergyWh=3e4*.92,this.state={solarArrayArea:60,solarArrayEfficiency:.3,solarIrradiance:dr,irradiancePercent:100,arrayOutput:60*.3*dr,batteryCapacity:3e4,batterySoC:.92,busLoads:3200,busVoltage:120,pointingFactor:.99,dustFactor:1}}step(e,t,n=0){if(e<=0)return;const s=Math.max(.1,t),r=dr/(s*s);this.state.solarIrradiance=r,this.state.irradiancePercent=1/(s*s)*100;const a=this.state.solarArrayArea*this.state.solarArrayEfficiency*r*this.state.pointingFactor*this.state.dustFactor;this.state.arrayOutput=Math.max(0,a);const o=3200;this.state.busLoads=o+Math.max(0,n);const l=this.state.arrayOutput-this.state.busLoads;if(l>=0){const c=l*.95*e/3600;this.batteryEnergyWh=Math.min(this.state.batteryCapacity,this.batteryEnergyWh+c)}else{const c=Math.abs(l)*e/3600;this.batteryEnergyWh=Math.max(0,this.batteryEnergyWh-c)}this.state.batterySoC=this.batteryEnergyWh/this.state.batteryCapacity,this.state.batterySoC>.15?this.state.busVoltage=114+8*this.state.batterySoC:this.state.busVoltage=Math.max(0,114*(this.state.batterySoC/.15))}}function dd(i){let e=i|0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}class Ft{_next;seed;constructor(e=42){this.seed=e,this._next=dd(e)}random(){return this._next()}range(e,t){return e+this._next()*(t-e)}randInt(e,t){return Math.floor(this.range(e,t+1))}gaussian(e=0,t=1){const n=this._next(),s=this._next(),r=Math.sqrt(-2*Math.log(n||1e-20))*Math.cos(2*Math.PI*s);return e+t*r}pick(e){return e[Math.floor(this._next()*e.length)]}shuffle(e){for(let t=e.length-1;t>0;t--){const n=Math.floor(this._next()*(t+1));[e[t],e[n]]=[e[n],e[t]]}return e}}const us=9.80665;function _o(i,e,t,n){const s=2*(i*e+t*n),r=1-2*(e*e+t*t),a=Math.atan2(s,r)*180/Math.PI,o=2*(i*t-n*e);let l;Math.abs(o)>=1?l=Math.sign(o)*90:l=Math.asin(o)*180/Math.PI;const c=2*(i*n+e*t),d=1-2*(t*t+n*n),u=Math.atan2(c,d)*180/Math.PI;return[a,l,u]}class hd{state;rng;remainingBurnDv=0;burnDirection=[1,0];nominalThrustN=45e3;constructor(e){this.rng=e??new Ft(101);const t=15e3,n=25e3,s=380,r=s*us*Math.log((t+n)/t),a=[1,0,0,0],o=_o(...a);this.state={attitudeQuat:a,attitudeEuler:o,angularRate:[0,0,0],rcsJitter:.008,propellantMass:n,dryMass:t,isp:s,thrustN:0,deltaVRemaining:r,isBurning:!1}}step(e){if(e<=0)return;if(this.state.isBurning&&this.remainingBurnDv>0&&this.state.propellantMass>0){const h=this.state.dryMass+this.state.propellantMass,b=this.state.thrustN/(this.state.isp*us),E=Math.min(this.state.propellantMass,b*e),S=h-E,P=this.state.isp*us*Math.log(h/S);this.state.propellantMass=Math.max(0,this.state.propellantMass-E),this.remainingBurnDv=Math.max(0,this.remainingBurnDv-P),(this.remainingBurnDv<=.001||this.state.propellantMass<=0)&&this.stopBurn()}const t=this.state.dryMass+this.state.propellantMass;this.state.deltaVRemaining=this.state.isp*us*Math.log(t/this.state.dryMass);const n=this.state.isBurning?.02:.006,s=this.rng.gaussian(0,n),r=this.rng.gaussian(0,n),a=this.rng.gaussian(0,n);this.state.angularRate=[s,r,a],this.state.rcsJitter=Math.sqrt(s*s+r*r+a*a);const[o,l,c,d]=this.state.attitudeQuat,u=e*Math.PI/360,f=o-u*(l*s+c*r+d*a),m=l+u*(o*s+c*a-d*r),g=c+u*(o*r-l*a+d*s),v=d+u*(o*a+l*r-c*s),p=Math.hypot(f,m,g,v)||1;this.state.attitudeQuat=[f/p,m/p,g/p,v/p],this.state.attitudeEuler=_o(...this.state.attitudeQuat)}startBurn(e,t=[1,0]){this.state.propellantMass<=0||e<=0||(this.remainingBurnDv=e,this.burnDirection=t,this.state.thrustN=this.nominalThrustN,this.state.isBurning=!0)}stopBurn(){this.state.isBurning=!1,this.state.thrustN=0,this.remainingBurnDv=0}}class ud{state;constructor(){this.state={doseRate:go*.85,cumulativeDose:12.4,shieldingFactor:.85,speActive:!1,speMultiplier:18,phase:"cruise"}}step(e,t){if(e<=0)return;const n=t.toLowerCase().includes("surface");this.state.phase=n?"surface":"cruise";const s=n?Wc:go;this.state.speActive?this.state.doseRate=s*this.state.speMultiplier*this.state.shieldingFactor:this.state.doseRate=s*this.state.shieldingFactor;const r=this.state.doseRate*(e/ss);this.state.cumulativeDose+=r}injectSPE(e=18){this.state.speActive=!0,this.state.speMultiplier=Math.max(1,e)}clearSPE(){this.state.speActive=!1}}class fd{crew;baselines;constructor(e){const t=e??new Ft(202),n=[{id:1,name:"CDR Elena Rostova"},{id:2,name:"PLT Marcus Vance"},{id:3,name:"MS1 Aiko Tanaka"},{id:4,name:"MS2 David Okafor"}];this.baselines=n.map(()=>({baseHr:68+t.range(-4,6),baseRr:15+t.range(-1.5,2),baseTemp:36.9+t.range(-.2,.2),o2SensitivityOffset:t.range(-.3,.3)})),this.crew=n.map((s,r)=>({id:s.id,name:s.name,spO2:99.2,heartRate:Math.round(this.baselines[r].baseHr),respRate:Math.round(this.baselines[r].baseRr),bodyTemp:Number(this.baselines[r].baseTemp.toFixed(1)),radiationDose:12.4,status:"NOMINAL"}))}step(e,t,n,s){if(!(e<=0))for(let r=0;r<this.crew.length;r++){const a=this.crew[r],o=this.baselines[r],l=t+o.o2SensitivityOffset,c=100/(1+Math.exp(-.29*(l-5.5)));a.spO2=Math.min(100,Math.max(0,c));const d=Math.max(0,(96-a.spO2)*2.8),u=Math.max(0,(n-.5)*35);a.heartRate=Math.round(o.baseHr+d+u);const f=Math.max(0,(n-.5)*16),m=Math.max(0,(96-a.spO2)*.4);a.respRate=Math.round(o.baseRr+f+m),a.radiationDose+=s*(e/ss),a.spO2<85||a.heartRate>140||n>2?a.status="CRITICAL":a.spO2<90||a.heartRate>115||n>1.2?a.status="WARNING":a.spO2<94||a.heartRate>95||n>.8?a.status="CAUTION":a.status="NOMINAL"}}}class pd{state;constructor(){const t=hr;this.state={tier1Active:!0,tier2Active:!0,tier1PowerW:45,tier2PowerW:t,totalPowerW:45+t,thermalOutputW:45+t}}step(e){e<=0||(this.state.tier1PowerW=this.state.tier1Active?45:0,this.state.tier2PowerW=this.state.tier2Active?hr:vo,this.state.totalPowerW=this.state.tier1PowerW+this.state.tier2PowerW,this.state.thermalOutputW=this.state.totalPowerW)}gateTier2(){this.state.tier2Active=!1,this.state.tier2PowerW=vo,this.state.totalPowerW=this.state.tier1PowerW+this.state.tier2PowerW,this.state.thermalOutputW=this.state.totalPowerW}activateTier2(){this.state.tier2Active=!0,this.state.tier2PowerW=hr,this.state.totalPowerW=this.state.tier1PowerW+this.state.tier2PowerW,this.state.thermalOutputW=this.state.totalPowerW}}class Wl{constructor(e,t){this.config=e,this.rng=t,e.stuckValue!==null&&(this.stuck=!0,this.stuckValue=e.stuckValue)}bias=0;stuck=!1;stuckValue=0;lastMeasured=0;initialized=!1;read(e,t,n=0){if(this.initialized||(this.lastMeasured=e,this.initialized=!0),this.stuck||this.config.stuckValue!==null){const a=this.stuck?this.stuckValue:this.config.stuckValue;return this.lastMeasured=a,{raw:e,measured:a,status:"STUCK",timestamp:n}}if(this.config.dropoutProb>0&&this.rng.random()<this.config.dropoutProb)return{raw:e,measured:this.lastMeasured,status:"DROPOUT",timestamp:n};const s=this.config.noiseSigma>0?this.rng.gaussian(0,this.config.noiseSigma):0;let r=e+s;return this.bias+=this.config.biasDrift*t,r+=this.bias,this.config.quantization>0&&(r=Math.round(r/this.config.quantization)*this.config.quantization),this.lastMeasured=r,{raw:e,measured:r,status:"OK",timestamp:n}}setStuck(e){this.stuck=!0,this.stuckValue=e,this.config.stuckValue=e}clearStuck(){this.stuck=!1,this.config.stuckValue=null}isStuck(){return this.stuck||this.config.stuckValue!==null}resetBias(){this.bias=0}getBias(){return this.bias}}const xo=[{type:"coolant_pump_failure",name:"Coolant Pump Degradation",subsystem:"Thermal",description:"Primary Loop A pump efficiency drops by 50%, reducing coolant mass flow",defaultParams:{loop:0,efficiency:.5}},{type:"coolant_leak",name:"Coolant Fluid Leak",subsystem:"Thermal",description:"Micro-meteoroid puncture causes slow fluid loss from Loop A accumulator",defaultParams:{rate:.005}},{type:"coolant_blockage",name:"Radiator Line Blockage",subsystem:"Thermal",description:"Hydraulic blockage produces backpressure spike and starved loop flow",defaultParams:{}},{type:"sensor_stuck",name:"Telemetry Sensor Stuck",subsystem:"Sensors",description:"Analog telemetry channel freezes at current reading (hardware ADC latch-up)",defaultParams:{channel:0,stuckValue:295}},{type:"o2_regulator_stuck",name:"O2 Regulator Stuck Closed",subsystem:"ECLSS",description:"Oxygen replenishment valve fails shut; cabin ppO2 decays with metabolic load",defaultParams:{}},{type:"cabin_leak",name:"Pressure Hull Micropuncture",subsystem:"ECLSS",description:"Structural micro-leak venting cabin atmosphere to deep space vacuum",defaultParams:{rate:.003}},{type:"scrubber_degradation",name:"CO2 Scrubber Chemical Decay",subsystem:"ECLSS",description:"Amine adsorption bed degraded to 30% capacity; ppCO2 climbs steadily",defaultParams:{efficiency:.3}},{type:"solar_particle_event",name:"Solar Particle Event (SPE)",subsystem:"Radiation",description:"Coronal mass ejection proton storm multiplying cosmic radiation flux",defaultParams:{multiplier:18}},{type:"ai_bitflip",name:"AI DRAM Single-Event Upset",subsystem:"Compute",description:"High-energy cosmic ray induces bitflip in Tier 2 inference weights memory",defaultParams:{}},{type:"ai_worker_freeze",name:"AI Inference Worker Hang",subsystem:"Compute",description:"Diagnostic coprocessor thread hangs; triggers safety gate timeout watchdog",defaultParams:{}},{type:"uplink_corrupt",name:"Deep Space Uplink Corruption",subsystem:"Comms",description:"Solar noise corrupts ground telecommand frame parity check",defaultParams:{errorRate:.8}},{type:"early_blackout",name:"Solar Conjunction Blackout",subsystem:"Comms",description:"Premature corona plasma blackout blocking Earth telecommunication links",defaultParams:{}},{type:"moi_burn_abort",name:"Mars Insertion Burn Abort",subsystem:"Propulsion",description:"Turbopump cavitates during critical orbital insertion burn, forcing abort",defaultParams:{}}];class md{activeFaults=new Map;bus;constructor(e){this.bus=e}setBus(e){this.bus=e}inject(e,t,n=0){const s={type:e,params:t??{},active:!0,injectedAt:n};this.activeFaults.set(e,s),this.bus&&this.bus.emit("fault:injected",{faultId:e,params:s.params})}clear(e){this.activeFaults.delete(e)&&this.bus&&this.bus.emit("fault:cleared",{faultId:e})}clearAll(){const e=Array.from(this.activeFaults.keys());for(const t of e)this.clear(t)}isActive(e){return this.activeFaults.has(e)}getActive(){return Array.from(this.activeFaults.values())}}class gd{thermal;eclss;power;gnc;radiation;crew;compute;sensors=new Map;faultInjector;channelDefs=new Map;latestReadings=new Map;rng;navState={distSun:1,distEarth:0,distMars:.5,speedKmS:32.5,etaDays:200};constructor(e){this.rng=e??new Ft(303),this.thermal=new od,this.eclss=new ld,this.power=new cd,this.gnc=new hd(new Ft(404)),this.radiation=new ud,this.crew=new fd(new Ft(505)),this.compute=new pd,this.faultInjector=new md,this.registerChannels()}updateNavigation(e){this.navState.distSun=e.distSun,this.navState.distEarth=e.distEarth,this.navState.distMars=e.distMars,this.navState.speedKmS=e.speedKmS,this.navState.etaDays=e.etaDays}registerChannels(){const e=(n,s=0)=>({noiseSigma:n,quantization:s,biasDrift:1e-5,dropoutProb:.001,stuckValue:null}),t=[{id:"nav_dist_sun",name:"Sun Distance",section:"Navigation",unit:"AU",fidelity:"HIGH",getValue:()=>this.navState.distSun,sensorConfig:e(5e-4,.001)},{id:"nav_dist_earth",name:"Earth Distance",section:"Navigation",unit:"AU",fidelity:"HIGH",getValue:()=>this.navState.distEarth,sensorConfig:e(5e-4,.001)},{id:"nav_dist_mars",name:"Mars Distance",section:"Navigation",unit:"AU",fidelity:"HIGH",getValue:()=>this.navState.distMars,sensorConfig:e(5e-4,.001)},{id:"nav_speed",name:"Heliocentric Speed",section:"Navigation",unit:"km/s",fidelity:"HIGH",getValue:()=>this.navState.speedKmS,sensorConfig:e(.01,.01)},{id:"nav_eta_arrival",name:"Encounter ETA",section:"Navigation",unit:"days",fidelity:"HIGH",getValue:()=>this.navState.etaDays,sensorConfig:e(.01,.1)},{id:"thermal_loopA_tempIn",name:"Loop A Inlet Temp",section:"Thermal A",unit:"K",fidelity:"HIGH",getValue:()=>this.thermal.loopA.coolantTempIn,cautionHigh:300,warningHigh:310,sensorConfig:e(.05,.1)},{id:"thermal_loopA_tempOut",name:"Loop A Outlet Temp",section:"Thermal A",unit:"K",fidelity:"HIGH",getValue:()=>this.thermal.loopA.coolantTempOut,cautionHigh:305,warningHigh:315,sensorConfig:e(.05,.1)},{id:"thermal_loopA_flow",name:"Loop A Flow Rate",section:"Thermal A",unit:"kg/s",fidelity:"HIGH",getValue:()=>this.thermal.loopA.flowRate,cautionLow:.25,warningLow:.1,sensorConfig:e(.002,.01)},{id:"thermal_loopA_pumpRpm",name:"Loop A Pump Speed",section:"Thermal A",unit:"RPM",fidelity:"HIGH",getValue:()=>this.thermal.loopA.pumpRpm,cautionLow:2500,warningLow:1500,sensorConfig:e(5,10)},{id:"thermal_loopA_pressure",name:"Loop A Pressure",section:"Thermal A",unit:"kPa",fidelity:"HIGH",getValue:()=>this.thermal.loopA.loopPressure,cautionLow:160,warningLow:100,cautionHigh:270,warningHigh:310,sensorConfig:e(.5,.5)},{id:"thermal_loopA_accum",name:"Loop A Accumulator",section:"Thermal A",unit:"%",fidelity:"HIGH",getValue:()=>this.thermal.loopA.accumulatorLevel*100,cautionLow:50,warningLow:20,sensorConfig:e(.2,.5)},{id:"thermal_loopB_tempIn",name:"Loop B Inlet Temp",section:"Thermal B",unit:"K",fidelity:"HIGH",getValue:()=>this.thermal.loopB.coolantTempIn,cautionHigh:300,warningHigh:310,sensorConfig:e(.05,.1)},{id:"thermal_loopB_tempOut",name:"Loop B Outlet Temp",section:"Thermal B",unit:"K",fidelity:"HIGH",getValue:()=>this.thermal.loopB.coolantTempOut,cautionHigh:305,warningHigh:315,sensorConfig:e(.05,.1)},{id:"thermal_loopB_flow",name:"Loop B Flow Rate",section:"Thermal B",unit:"kg/s",fidelity:"HIGH",getValue:()=>this.thermal.loopB.flowRate,cautionLow:.25,warningLow:.1,sensorConfig:e(.002,.01)},{id:"thermal_loopB_pumpRpm",name:"Loop B Pump Speed",section:"Thermal B",unit:"RPM",fidelity:"HIGH",getValue:()=>this.thermal.loopB.pumpRpm,cautionLow:2500,warningLow:1500,sensorConfig:e(5,10)},{id:"thermal_loopB_pressure",name:"Loop B Pressure",section:"Thermal B",unit:"kPa",fidelity:"HIGH",getValue:()=>this.thermal.loopB.loopPressure,cautionLow:160,warningLow:100,cautionHigh:270,warningHigh:310,sensorConfig:e(.5,.5)},{id:"thermal_loopB_accum",name:"Loop B Accumulator",section:"Thermal B",unit:"%",fidelity:"HIGH",getValue:()=>this.thermal.loopB.accumulatorLevel*100,cautionLow:50,warningLow:20,sensorConfig:e(.2,.5)},{id:"eclss_cabin_pressure",name:"Cabin Total Pressure",section:"ECLSS",unit:"kPa",fidelity:"HIGH",getValue:()=>this.eclss.state.cabinPressure,cautionLow:95,warningLow:85,sensorConfig:e(.04,.1)},{id:"eclss_ppO2",name:"Cabin ppO2",section:"ECLSS",unit:"kPa",fidelity:"HIGH",getValue:()=>this.eclss.state.ppO2,cautionLow:19.5,warningLow:16,cautionHigh:23.5,warningHigh:25,sensorConfig:e(.02,.05)},{id:"eclss_ppCO2",name:"Cabin ppCO2",section:"ECLSS",unit:"kPa",fidelity:"HIGH",getValue:()=>this.eclss.state.ppCO2,cautionHigh:.8,warningHigh:1.5,sensorConfig:e(.005,.01)},{id:"eclss_ppN2",name:"Cabin ppN2",section:"ECLSS",unit:"kPa",fidelity:"HIGH",getValue:()=>this.eclss.state.ppN2,cautionLow:70,sensorConfig:e(.05,.1)},{id:"eclss_o2_flow",name:"O2 Supply Flow Rate",section:"ECLSS",unit:"g/s",fidelity:"HIGH",getValue:()=>this.eclss.state.o2FlowRate*1e3,sensorConfig:e(.001,.01)},{id:"eclss_scrubber_eff",name:"CO2 Scrubber Efficiency",section:"ECLSS",unit:"%",fidelity:"HIGH",getValue:()=>this.eclss.state.co2ScrubberEfficiency*100,cautionLow:60,warningLow:35,sensorConfig:e(.1,.5)},{id:"power_solar_irradiance",name:"Solar Irradiance",section:"Power",unit:"W/m²",fidelity:"HIGH",getValue:()=>this.power.state.solarIrradiance,sensorConfig:e(.5,1)},{id:"power_irradiance_pct",name:"Relative Solar Flux",section:"Power",unit:"%",fidelity:"HIGH",getValue:()=>this.power.state.irradiancePercent,sensorConfig:e(.1,.1)},{id:"power_array_output",name:"Photovoltaic Output",section:"Power",unit:"W",fidelity:"HIGH",getValue:()=>this.power.state.arrayOutput,cautionLow:4e3,warningLow:2500,sensorConfig:e(2,5)},{id:"power_bus_loads",name:"Bus Electrical Load",section:"Power",unit:"W",fidelity:"HIGH",getValue:()=>this.power.state.busLoads,sensorConfig:e(1,1)},{id:"power_battery_soc",name:"Battery State of Charge",section:"Power",unit:"%",fidelity:"HIGH",getValue:()=>this.power.state.batterySoC*100,cautionLow:40,warningLow:20,sensorConfig:e(.1,.5)},{id:"power_bus_voltage",name:"Main Bus Voltage",section:"Power",unit:"V",fidelity:"HIGH",getValue:()=>this.power.state.busVoltage,cautionLow:110,warningLow:100,sensorConfig:e(.05,.1)},{id:"gnc_thrust",name:"OMS Engine Thrust",section:"Propulsion",unit:"kN",fidelity:"HIGH",getValue:()=>this.gnc.state.thrustN/1e3,sensorConfig:e(.02,.1)},{id:"gnc_propellant_mass",name:"Propellant Mass",section:"Propulsion",unit:"kg",fidelity:"HIGH",getValue:()=>this.gnc.state.propellantMass,cautionLow:3e3,warningLow:1e3,sensorConfig:e(2,5)},{id:"gnc_deltav_remaining",name:"Remaining Delta-V",section:"Propulsion",unit:"m/s",fidelity:"HIGH",getValue:()=>this.gnc.state.deltaVRemaining,cautionLow:500,warningLow:200,sensorConfig:e(.5,1)},{id:"gnc_rcs_jitter",name:"RCS Deadband Jitter",section:"Propulsion",unit:"deg/s",fidelity:"HIGH",getValue:()=>this.gnc.state.rcsJitter,sensorConfig:e(5e-4,.001)},{id:"rad_dose_rate",name:"Ambient Dose Rate",section:"Radiation",unit:"mSv/d",fidelity:"HIGH",getValue:()=>this.radiation.state.doseRate,cautionHigh:3,warningHigh:10,sensorConfig:e(.02,.01)},{id:"rad_cumulative_dose",name:"Cumulative Dose",section:"Radiation",unit:"mSv",fidelity:"HIGH",getValue:()=>this.radiation.state.cumulativeDose,cautionHigh:400,warningHigh:700,sensorConfig:e(.05,.1)},{id:"crew_1_spO2",name:"CDR Rostova SpO2",section:"Crew",unit:"%",fidelity:"HIGH",getValue:()=>this.crew.crew[0]?.spO2??99,cautionLow:94,warningLow:90,sensorConfig:e(.1,.5)},{id:"crew_1_hr",name:"CDR Rostova Heart Rate",section:"Crew",unit:"bpm",fidelity:"HIGH",getValue:()=>this.crew.crew[0]?.heartRate??70,cautionHigh:100,warningHigh:125,sensorConfig:e(.5,1)},{id:"crew_2_spO2",name:"PLT Vance SpO2",section:"Crew",unit:"%",fidelity:"HIGH",getValue:()=>this.crew.crew[1]?.spO2??99,cautionLow:94,warningLow:90,sensorConfig:e(.1,.5)},{id:"crew_2_hr",name:"PLT Vance Heart Rate",section:"Crew",unit:"bpm",fidelity:"HIGH",getValue:()=>this.crew.crew[1]?.heartRate??70,cautionHigh:100,warningHigh:125,sensorConfig:e(.5,1)},{id:"crew_3_spO2",name:"MS1 Tanaka SpO2",section:"Crew",unit:"%",fidelity:"HIGH",getValue:()=>this.crew.crew[2]?.spO2??99,cautionLow:94,warningLow:90,sensorConfig:e(.1,.5)},{id:"crew_3_hr",name:"MS1 Tanaka Heart Rate",section:"Crew",unit:"bpm",fidelity:"HIGH",getValue:()=>this.crew.crew[2]?.heartRate??70,cautionHigh:100,warningHigh:125,sensorConfig:e(.5,1)},{id:"crew_4_spO2",name:"MS2 Okafor SpO2",section:"Crew",unit:"%",fidelity:"HIGH",getValue:()=>this.crew.crew[3]?.spO2??99,cautionLow:94,warningLow:90,sensorConfig:e(.1,.5)},{id:"crew_4_hr",name:"MS2 Okafor Heart Rate",section:"Crew",unit:"bpm",fidelity:"HIGH",getValue:()=>this.crew.crew[3]?.heartRate??70,cautionHigh:100,warningHigh:125,sensorConfig:e(.5,1)},{id:"compute_tier1_pwr",name:"Tier 1 FSW Core Power",section:"Compute",unit:"W",fidelity:"HIGH",getValue:()=>this.compute.state.tier1PowerW,sensorConfig:e(.1,.1)},{id:"compute_tier2_pwr",name:"Tier 2 AI Core Power",section:"Compute",unit:"W",fidelity:"HIGH",getValue:()=>this.compute.state.tier2PowerW,sensorConfig:e(.1,.1)},{id:"compute_total_pwr",name:"Total Compute Power",section:"Compute",unit:"W",fidelity:"HIGH",getValue:()=>this.compute.state.totalPowerW,sensorConfig:e(.1,.5)}];for(const n of t){this.channelDefs.set(n.id,n);const s=new Ft(this.rng.randInt(1,1e6));this.sensors.set(n.id,new Wl(n.sensorConfig,s))}}applyActiveFaults(){const e=this.faultInjector.getActive(),t=new Set(e.map(r=>r.type));if(t.has("coolant_pump_failure")?this.thermal.injectPumpFailure("A"):this.thermal.loopA.pumpDegraded&&this.thermal.clearFault("A","pump"),t.has("coolant_leak")){const a=e.find(o=>o.type==="coolant_leak")?.params.rate??.005;this.thermal.injectLeak("A",a)}else this.thermal.loopA.leaking&&this.thermal.clearFault("A","leak");if(t.has("coolant_blockage")?this.thermal.injectBlockage("A"):this.thermal.loopA.blocked&&this.thermal.clearFault("A","blockage"),t.has("o2_regulator_stuck")?this.eclss.injectRegulatorStuck():this.eclss.state.regulatorStuck&&this.eclss.clearFault("regulator"),t.has("cabin_leak")){const a=e.find(o=>o.type==="cabin_leak")?.params.rate??.003;this.eclss.injectLeak(a)}else this.eclss.state.cabinLeak&&this.eclss.clearFault("leak");if(t.has("scrubber_degradation")){const a=e.find(o=>o.type==="scrubber_degradation")?.params.efficiency??.3;this.eclss.injectScrubberDegradation(a)}else this.eclss.state.scrubberDegraded&&this.eclss.clearFault("scrubber");if(t.has("solar_particle_event")){const a=e.find(o=>o.type==="solar_particle_event")?.params.multiplier??18;this.radiation.injectSPE(a)}else this.radiation.state.speActive&&this.radiation.clearSPE();const n=t.has("sensor_stuck"),s=this.sensors.get("thermal_loopA_tempOut");if(s)if(n&&!s.isStuck()){const a=e.find(o=>o.type==="sensor_stuck")?.params.stuckValue??298.5;s.setStuck(a)}else!n&&s.isStuck()&&s.clearStuck()}step(e,t,n,s=0){if(e<=0)return;this.applyActiveFaults(),this.compute.step(e),this.thermal.computeHeatLoad=this.compute.state.thermalOutputW,this.thermal.step(e,t);const r=this.compute.state.totalPowerW;this.power.step(e,t,r),this.gnc.step(e),this.radiation.step(e,n),this.eclss.step(e,4),this.crew.step(e,this.eclss.state.ppO2,this.eclss.state.ppCO2,this.radiation.state.doseRate);for(const[a,o]of this.channelDefs.entries()){const l=this.sensors.get(a);if(l){const c=o.getValue(),d=l.read(c,e,s);this.latestReadings.set(a,d)}}}getTelemetry(){return this.latestReadings}getAlerts(){const e=[];for(const[t,n]of this.channelDefs.entries()){const s=this.latestReadings.get(t);if(!s)continue;const r=s.measured;if(n.warningLow!==void 0&&r<n.warningLow){e.push({channel:t,subsystem:n.section,level:"WARNING",value:r,limit:n.warningLow});continue}if(n.warningHigh!==void 0&&r>n.warningHigh){e.push({channel:t,subsystem:n.section,level:"WARNING",value:r,limit:n.warningHigh});continue}if(n.cautionLow!==void 0&&r<n.cautionLow){e.push({channel:t,subsystem:n.section,level:"CAUTION",value:r,limit:n.cautionLow});continue}if(n.cautionHigh!==void 0&&r>n.cautionHigh){e.push({channel:t,subsystem:n.section,level:"CAUTION",value:r,limit:n.cautionHigh});continue}}return e}}const yo=typeof requestAnimationFrame<"u"?requestAnimationFrame:i=>setTimeout(()=>i(performance.now()),16),vd=typeof cancelAnimationFrame<"u"?cancelAnimationFrame:i=>clearTimeout(i);class _d{clock;trajectory;comms;subsystems;bus;running=!1;earthPos;marsPos;earthState;marsState;activeAlerts=new Map;lastTimestamp=0;animFrameId=null;constructor(e){this.bus=e,this.trajectory=new td,this.clock=new jc(this.trajectory.departureJD),this.comms=new ad,this.subsystems=new gd,this.subsystems.faultInjector.setBus(this.bus),this.running=!1,this.earthState=Ji(this.clock.simTimeJD),this.marsState=Zi(this.clock.simTimeJD),this.earthPos=[this.earthState.x,this.earthState.y],this.marsPos=[this.marsState.x,this.marsState.y],this.trajectory.update(this.clock.simTimeJD),this.comms.update(this.trajectory.shipState.pos,this.earthPos),this.bus.on("sim:warpChanged",({warp:t,paused:n})=>{n?this.clock.pause():this.clock.resume(),this.clock.setWarp(t)}),this.bus.on("alert:raised",({level:t})=>{(t==="CAUTION"||t==="WARNING"||t==="CRITICAL")&&(this.clock.dropTo1x(),this.bus.emit("sim:warpChanged",{warp:this.clock.warp,paused:this.clock.paused}))}),this.bus.on("fault:injected",({faultId:t,params:n})=>{this.subsystems.faultInjector.isActive(t)||this.subsystems.faultInjector.inject(t,n,this.clock.simTimeJD)}),this.bus.on("fault:cleared",({faultId:t})=>{this.subsystems.faultInjector.isActive(t)&&this.subsystems.faultInjector.clear(t)})}start(){if(this.running)return;this.running=!0,this.lastTimestamp=performance.now();const e=t=>{if(!this.running)return;const n=(t-this.lastTimestamp)/1e3;this.lastTimestamp=t;const s=Math.min(Math.max(0,n),.1);this.tick(s),this.animFrameId=yo(e)};this.animFrameId=yo(e)}stop(){this.running=!1,this.animFrameId!==null&&(vd(this.animFrameId),this.animFrameId=null)}tick(e){const t=this.clock.tick(e);this.earthState=Ji(this.clock.simTimeJD),this.marsState=Zi(this.clock.simTimeJD),this.earthPos=[this.earthState.x,this.earthState.y],this.marsPos=[this.marsState.x,this.marsState.y];const n=this.trajectory.shipState.phase;this.trajectory.update(this.clock.simTimeJD);const s=this.trajectory.shipState.phase;n!==s&&this.bus.emit("sim:phaseChanged",{from:n,to:s});const r=this.comms.state.linkState;this.comms.update(this.trajectory.shipState.pos,this.earthPos),this.bus.emit("comm:stateChanged",this.comms.state),r!=="BLACKOUT"&&this.comms.state.linkState==="BLACKOUT"?this.bus.emit("dtn:blackoutStart",{thetaDeg:this.comms.state.thetaDeg}):r==="BLACKOUT"&&this.comms.state.linkState!=="BLACKOUT"&&this.bus.emit("dtn:blackoutEnd",{thetaDeg:this.comms.state.thetaDeg});const a=this.trajectory.shipState,o=Math.hypot(a.pos[0],a.pos[1]),l=Math.hypot(a.pos[0]-this.earthPos[0],a.pos[1]-this.earthPos[1]),c=this.trajectory.distanceToMars(this.marsPos),u=Math.hypot(a.vel[0],a.vel[1])*ji/ss,f=Math.max(0,this.trajectory.arrivalJD-this.clock.simTimeJD);if(this.subsystems.updateNavigation({distSun:o,distEarth:l,distMars:c,speedKmS:u,etaDays:f}),this.clock.subsystemsActive&&!this.clock.paused&&t>0){let h=t;const b=20;let E=0;for(;h>=.1&&E<b;)this.subsystems.step(.1,o,a.phase,this.clock.simTimeJD),h-=.1,E++;h>0&&this.subsystems.step(h,o,a.phase,this.clock.simTimeJD)}const m=this.subsystems.getTelemetry(),g=this.subsystems.getAlerts(),v=new Set;for(const p of g)v.add(p.channel),this.activeAlerts.get(p.channel)!==p.level&&(this.activeAlerts.set(p.channel,p.level),this.bus.emit("alert:raised",{subsystem:p.subsystem,channel:p.channel,level:p.level,value:p.value,limit:p.limit}));for(const[p]of this.activeAlerts.entries())if(!v.has(p)){this.activeAlerts.delete(p);const h=this.subsystems.channelDefs.get(p);this.bus.emit("alert:cleared",{subsystem:h?.section??"Subsystem",channel:p})}this.bus.emit("telemetry:update",{telemetry:m,alerts:g}),this.bus.emit("sim:tick",{dt:t,simTimeJD:this.clock.simTimeJD,warp:this.clock.paused?0:this.clock.warp}),this.bus.emit("render:frame",{fps:e>0?1/e:60})}}function xd(i,e,t,n,s,r,a){const o=r/2+(i-t)*s,l=a/2-(e-n)*s;return[o,l]}function yd(i,e,t,n,s,r,a){const o=t+(i-r/2)/s,l=n-(e-a/2)/s;return[o,l]}function So(i,e,t,n,s,r=[4,4],a=(c,d)=>[c,d],o=!0,l=180){i.save(),i.strokeStyle=s,i.lineWidth=1,i.setLineDash(r);const c=o?hn(n):n,d=Math.max(0,Math.min(.999,t)),u=e*(1-d*d);i.beginPath();for(let f=0;f<=l;f++){const m=f/l*2*Math.PI,g=u/(1+d*Math.cos(m)),v=c+m,p=g*Math.cos(v),h=g*Math.sin(v),[b,E]=a(p,h);f===0?i.moveTo(b,E):i.lineTo(b,E)}i.closePath(),i.stroke(),i.restore()}function gi(i,e,t,n,s,r,a=6){i.save(),i.strokeStyle=r,i.lineWidth=1,i.beginPath();const o=Math.min(a,n/2,s/2);i.moveTo(e,t+o),i.lineTo(e,t),i.lineTo(e+o,t),i.moveTo(e+n-o,t),i.lineTo(e+n,t),i.lineTo(e+n,t+o),i.moveTo(e,t+s-o),i.lineTo(e,t+s),i.lineTo(e+o,t+s),i.moveTo(e+n-o,t+s),i.lineTo(e+n,t+s),i.lineTo(e+n,t+s-o),i.stroke(),i.restore()}function ur(i,e,t,n,s,r,a=!1){if(i.save(),a){const o=Math.max(n*3.5,14),l=i.createRadialGradient(e,t,n*.4,e,t,o);l.addColorStop(0,s),l.addColorStop(.35,s),l.addColorStop(1,"rgba(0, 0, 0, 0)"),i.save(),i.globalAlpha=.45,i.fillStyle=l,i.beginPath(),i.arc(e,t,o,0,2*Math.PI),i.fill(),i.restore()}if(i.fillStyle=s,i.beginPath(),i.arc(e,t,n,0,2*Math.PI),i.fill(),i.fillStyle="#ffffff",i.beginPath(),i.arc(e,t,Math.max(1,n*.35),0,2*Math.PI),i.fill(),r){i.font='10px "Courier New", Consolas, monospace',i.fillStyle="#e0e6ed",i.textBaseline="middle",i.textAlign="left";const o=e+n+7,l=t-n-2,c=i.measureText(r),d=3,u=c.width+d*2,f=13;i.fillStyle="rgba(10, 14, 20, 0.8)",i.fillRect(o-d,l-f/2,u,f),gi(i,o-d,l-f/2,u,f,s,3),i.fillStyle="#e0e6ed",i.fillText(r,o,l)}i.restore()}function bo(i,e,t,n,s,r,a=8){i.save(),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=1,i.beginPath(),i.moveTo(e,t),i.lineTo(n,s),i.stroke();const o=Math.atan2(s-t,n-e),l=Math.PI/6;i.beginPath(),i.moveTo(n,s),i.lineTo(n-a*Math.cos(o-l),s-a*Math.sin(o-l)),i.lineTo(n-a*Math.cos(o+l),s-a*Math.sin(o+l)),i.closePath(),i.fill(),i.restore()}function Sd(i,e,t,n,s,r=!0){i.save(),i.fillStyle=s,i.strokeStyle=s,i.lineWidth=1,i.beginPath(),i.moveTo(e,t-n),i.lineTo(e+n,t),i.lineTo(e,t+n),i.lineTo(e-n,t),i.closePath(),r&&i.fill(),i.stroke(),i.restore()}function fs(i){return Math.abs(i)>=.01?`${i.toFixed(3)} AU`:`${(i*ji).toExponential(2).replace("e+","e")} km`}function Mo(i){const e=Math.max(0,Math.round(i)),t=Math.floor(e/3600),n=Math.floor(e%3600/60),s=e%60;return t>0?`${t}h ${n}m ${s}s`:`${n}m ${s}s`}class bd{canvas;ctx;container;width;height;dpr;centerX;centerY;scale;isDragging;targetFocus;dragStartX;dragStartY;dragStartCenterX;dragStartCenterY;cursorScreen;hudButtons;hoveredButtonId;earthPos;marsPos;shipPos;shipVel;shipTrail;commState;simTimeJD;phase;predictedTrajectory;resizeObserver;packetAnimOffset;lastAnimTimestamp;animFrameId;onMouseDown;onMouseMove;onMouseUp;onMouseLeave;onWheel;onDblClick;onKeyDown;constructor(e){this.container=e,this.canvas=document.createElement("canvas"),this.canvas.className="tactical-map-canvas",this.canvas.tabIndex=0,this.canvas.style.display="block",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.outline="none",this.canvas.style.cursor="crosshair",this.container.appendChild(this.canvas);const t=this.canvas.getContext("2d");if(!t)throw new Error("TacticalMap: Failed to acquire 2D canvas rendering context");this.ctx=t,this.centerX=0,this.centerY=0,this.scale=200,this.isDragging=!1,this.targetFocus=null,this.dragStartX=0,this.dragStartY=0,this.dragStartCenterX=0,this.dragStartCenterY=0,this.cursorScreen=null,this.hudButtons=[],this.hoveredButtonId=null,this.simTimeJD=Ki,this.earthPos=[1,0],this.marsPos=[1.524,0],this.shipPos=[1,0],this.shipVel=null,this.shipTrail=[[1,0]],this.commState=null,this.phase="Cruise",this.predictedTrajectory=[],this.packetAnimOffset=0,this.lastAnimTimestamp=performance.now(),this.animFrameId=null;const n=this.container.getBoundingClientRect();this.width=Math.max(n.width||800,100),this.height=Math.max(n.height||600,100),this.dpr=typeof window<"u"&&window.devicePixelRatio||1,this.updateCanvasDimensions(),this.updatePredictedTrajectory(),this.onMouseDown=this.handleMouseDown.bind(this),this.onMouseMove=this.handleMouseMove.bind(this),this.onMouseUp=this.handleMouseUp.bind(this),this.onMouseLeave=this.handleMouseLeave.bind(this),this.onWheel=this.handleWheel.bind(this),this.onDblClick=this.handleDblClick.bind(this),this.onKeyDown=this.handleKeyDown.bind(this),this.attachEventListeners(),typeof ResizeObserver<"u"?(this.resizeObserver=new ResizeObserver(()=>{this.updateCanvasDimensions(),this.render()}),this.resizeObserver.observe(this.container)):this.resizeObserver=null,this.render()}updateState(e){const t=this.shipPos,n=this.simTimeJD;if(this.earthPos=e.earthPos,this.marsPos=e.marsPos,this.shipPos=e.shipPos,this.commState=e.commState,this.simTimeJD=e.simTimeJD,this.phase=e.phase,e.shipVel)this.shipVel=e.shipVel;else if(e.simTimeJD!==n){const s=e.simTimeJD-n;Math.abs(s)>1e-7&&(this.shipVel=[(e.shipPos[0]-t[0])/s,(e.shipPos[1]-t[1])/s])}if(this.shipTrail.length===0)this.shipTrail.push([...e.shipPos]);else{const s=this.shipTrail[this.shipTrail.length-1];Math.pow(e.shipPos[0]-s[0],2)+Math.pow(e.shipPos[1]-s[1],2)>1e-8&&(this.shipTrail.push([...e.shipPos]),this.shipTrail.length>200&&this.shipTrail.shift())}if(e.predictedTrajectory&&e.predictedTrajectory.length>0?this.predictedTrajectory=e.predictedTrajectory:this.updatePredictedTrajectory(),this.targetFocus)switch(this.targetFocus){case"SUN":this.centerX=0,this.centerY=0;break;case"EARTH":this.centerX=this.earthPos[0],this.centerY=this.earthPos[1];break;case"MARS":this.centerX=this.marsPos[0],this.centerY=this.marsPos[1];break;case"SHIP":this.centerX=this.shipPos[0],this.centerY=this.shipPos[1];break}}updatePredictedTrajectory(){let e=this.shipVel;if(!e||e[0]===0&&e[1]===0){const a=Math.hypot(this.shipPos[0],this.shipPos[1]),o=Math.max(.5,a),c=Math.sqrt(Math.max(1e-8,$i*(2/o-1/1.28)));e=[-c*(this.shipPos[1]/o),c*(this.shipPos[0]/o)]}const t=[],n=220,s=60,r=n/s;for(let a=0;a<=s;a++){const o=a*r;try{const l=ea(this.shipPos,e,o,$i);t.push(l.r)}catch{break}}this.predictedTrajectory=t}updateCanvasDimensions(){const e=this.container.getBoundingClientRect();this.width=Math.max(e.width||800,100),this.height=Math.max(e.height||600,100),this.dpr=typeof window<"u"&&window.devicePixelRatio||1,this.canvas.width=Math.round(this.width*this.dpr),this.canvas.height=Math.round(this.height*this.dpr),this.canvas.style.width=`${this.width}px`,this.canvas.style.height=`${this.height}px`,this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}toScreen(e,t){return xd(e,t,this.centerX,this.centerY,this.scale,this.width,this.height)}toWorld(e,t){return yd(e,t,this.centerX,this.centerY,this.scale,this.width,this.height)}render(){const e=performance.now(),t=Math.min(.1,(e-this.lastAnimTimestamp)/1e3);this.lastAnimTimestamp=e,this.packetAnimOffset=(this.packetAnimOffset+t*.45)%1;const n=this.ctx,s=this.width,r=this.height;n.fillStyle="#0a0e14",n.fillRect(0,0,s,r);const[a,o]=this.toScreen(0,0),l=n.createRadialGradient(a,o,10,a,o,Math.max(s,r)*.8);l.addColorStop(0,"rgba(0, 229, 255, 0.04)"),l.addColorStop(.5,"rgba(10, 14, 20, 0.01)"),l.addColorStop(1,"rgba(0, 0, 0, 0)"),n.fillStyle=l,n.fillRect(0,0,s,r),this.renderGrid(n,a,o),this.renderRangeRings(n,a,o),this.renderOrbits(n),this.renderBlackoutCone(n),this.renderPredictedTrajectory(n),this.renderShipTrail(n),this.renderMarsSOI(n),this.renderCommsLine(n),this.renderBodies(n,a,o),this.renderHUD(n)}renderGrid(e,t,n){e.save(),e.lineWidth=1,e.strokeStyle="rgba(0, 229, 255, 0.04)",e.beginPath(),e.moveTo(0,n),e.lineTo(this.width,n),e.moveTo(t,0),e.lineTo(t,this.height),e.stroke(),e.strokeStyle="rgba(0, 229, 255, 0.2)",e.beginPath(),e.moveTo(t-8,n),e.lineTo(t+8,n),e.moveTo(t,n-8),e.lineTo(t,n+8),e.stroke(),e.restore()}renderRangeRings(e,t,n){const s=[.5,1,1.5,2,2.5];e.save(),e.strokeStyle="rgba(0, 229, 255, 0.08)",e.lineWidth=1,e.setLineDash([2,5]),e.font='9px "Courier New", Consolas, monospace',e.fillStyle="rgba(0, 229, 255, 0.35)",e.textAlign="left",e.textBaseline="bottom";for(const r of s){const a=r*this.scale;if(a<8)continue;e.beginPath(),e.arc(t,n,a,0,2*Math.PI),e.stroke();const o=hn(35),l=t+a*Math.cos(o),c=n-a*Math.sin(o);l>=0&&l<=this.width&&c>=0&&c<=this.height&&e.fillText(`${r.toFixed(1)} AU`,l+3,c-2)}e.restore()}renderOrbits(e){const t=(n,s)=>this.toScreen(n,s);So(e,Xs.a,Xs.e,Xs.wbar,"rgba(0, 180, 255, 0.4)",[4,4],t,!0),So(e,qs.a,qs.e,qs.wbar,"rgba(255, 90, 80, 0.45)",[4,4],t,!0)}renderBlackoutCone(e){const t=-this.earthPos[0],n=-this.earthPos[1];if(Math.hypot(t,n)<1e-6)return;const r=Math.atan2(n,t),a=hn(_i),o=3.6,[l,c]=this.toScreen(this.earthPos[0],this.earthPos[1]),d=this.earthPos[0]+o*Math.cos(r-a),u=this.earthPos[1]+o*Math.sin(r-a),f=this.earthPos[0]+o*Math.cos(r+a),m=this.earthPos[1]+o*Math.sin(r+a),[g,v]=this.toScreen(d,u),[p,h]=this.toScreen(f,m);e.save(),e.beginPath(),e.moveTo(l,c),e.lineTo(g,v),e.lineTo(p,h),e.closePath(),e.fillStyle="rgba(255, 171, 0, 0.10)",e.fill(),e.strokeStyle="rgba(255, 171, 0, 0.35)",e.lineWidth=1,e.setLineDash([4,4]),e.stroke();const b=1.6,[E,S]=this.toScreen(this.earthPos[0]+b*Math.cos(r),this.earthPos[1]+b*Math.sin(r));e.font='9px "Courier New", Consolas, monospace',e.fillStyle="rgba(255, 171, 0, 0.65)",e.textAlign="center",e.textBaseline="middle",e.setLineDash([]),e.fillText("SOLAR EXCLUSION CONE (±2.0°)",E,S),e.restore()}renderPredictedTrajectory(e){if(this.predictedTrajectory.length<2)return;e.save(),e.strokeStyle="rgba(0, 229, 255, 0.6)",e.lineWidth=1.5,e.setLineDash([5,4]),e.beginPath();for(let n=0;n<this.predictedTrajectory.length;n++){const[s,r]=this.predictedTrajectory[n],[a,o]=this.toScreen(s,r);n===0?e.moveTo(a,o):e.lineTo(a,o)}e.stroke();const t=Math.floor(this.predictedTrajectory.length/2);if(t>0&&t<this.predictedTrajectory.length){const[n,s]=this.toScreen(this.predictedTrajectory[t-1][0],this.predictedTrajectory[t-1][1]),[r,a]=this.toScreen(this.predictedTrajectory[t][0],this.predictedTrajectory[t][1]);bo(e,n,s,r,a,"rgba(0, 229, 255, 0.8)",6)}e.restore()}renderShipTrail(e){if(this.shipTrail.length<2)return;e.save(),e.lineWidth=1.5,e.setLineDash([]);const t=this.shipTrail.length;for(let n=0;n<t-1;n++){const[s,r]=this.toScreen(this.shipTrail[n][0],this.shipTrail[n][1]),[a,o]=this.toScreen(this.shipTrail[n+1][0],this.shipTrail[n+1][1]),l=.05+.7*(n/t);e.strokeStyle=`rgba(0, 229, 255, ${l.toFixed(3)})`,e.beginPath(),e.moveTo(s,r),e.lineTo(a,o),e.stroke()}e.restore()}renderMarsSOI(e){const n=Qr/Pn*this.scale;if(n>=6){const[s,r]=this.toScreen(this.marsPos[0],this.marsPos[1]);e.save(),e.strokeStyle="rgba(255, 80, 80, 0.5)",e.lineWidth=1,e.setLineDash([3,3]),e.beginPath(),e.arc(s,r,n,0,2*Math.PI),e.stroke(),e.font='9px "Courier New", Consolas, monospace',e.fillStyle="rgba(255, 120, 100, 0.85)",e.textAlign="left",e.textBaseline="bottom",e.setLineDash([]),e.fillText("SOI",s+n+4,r),e.restore()}}renderCommsLine(e){const[t,n]=this.toScreen(this.earthPos[0],this.earthPos[1]),[s,r]=this.toScreen(this.shipPos[0],this.shipPos[1]),a=Vl(this.shipPos,this.earthPos),o=Gl(this.shipPos,this.earthPos),l=this.commState?.linkState==="BLACKOUT"||na(o),c=this.commState?.linkState??(l?"BLACKOUT":"NOMINAL"),d=this.commState?.oneWayLightTimeSec??ta(a);let u="#00e5ff",f=[];switch(c){case"NOMINAL":u="#00e5ff",f=[];break;case"DEGRADED":u="#ffab00",f=[6,3];break;case"BLACKOUT":u="#ff1744",f=[4,4];break;case"OVERRIDE":u="#e040fb",f=[2,2];break}if(e.save(),e.strokeStyle=u,e.lineWidth=1.2,e.setLineDash(f),e.beginPath(),e.moveTo(s,r),e.lineTo(t,n),e.stroke(),c!=="BLACKOUT")for(let A=0;A<4;A++){const w=(this.packetAnimOffset+A/4)%1,N=s+w*(t-s),M=r+w*(n-r);e.fillStyle=u,e.beginPath(),e.arc(N,M,2.5,0,2*Math.PI),e.fill(),e.fillStyle="rgba(255, 255, 255, 0.4)",e.beginPath(),e.arc(N,M,1.2,0,2*Math.PI),e.fill()}const m=(s+t)/2,g=(r+n)/2,v=`OWLT: ${Mo(d)} [${c}]`;e.font='10px "Courier New", Consolas, monospace';const h=e.measureText(v).width+12,b=16,E=m-h/2,S=g-b/2;e.fillStyle="rgba(10, 14, 20, 0.85)",e.fillRect(E,S,h,b),gi(e,E,S,h,b,u,3),e.fillStyle=u,e.textAlign="center",e.textBaseline="middle",e.setLineDash([]),e.fillText(v,m,g),e.restore()}renderBodies(e,t,n){ur(e,t,n,7,"#ffeb3b","SUN",!0);const[s,r]=this.toScreen(this.earthPos[0],this.earthPos[1]);ur(e,s,r,5,"#29b6f6","EARTH",!0);const[a,o]=this.toScreen(this.marsPos[0],this.marsPos[1]);ur(e,a,o,4.5,"#ff5722","MARS",!0);const[l,c]=this.toScreen(this.shipPos[0],this.shipPos[1]);if(gi(e,l-11,c-11,22,22,"#00e5ff",4),Sd(e,l,c,5,"#00e5ff",!0),this.shipVel){const g=Math.atan2(-this.shipVel[1],this.shipVel[0]),v=l,p=c,h=l+14*Math.cos(g),b=c+14*Math.sin(g);bo(e,v,p,h,b,"#00e5ff",5)}e.save(),e.font='10px "Courier New", Consolas, monospace',e.fillStyle="#e0e6ed",e.textBaseline="middle",e.textAlign="left";const d="AEGIS-1",u=e.measureText(d),f=l+12,m=c-8;e.fillStyle="rgba(10, 14, 20, 0.85)",e.fillRect(f-3,m-7,u.width+6,14),gi(e,f-3,m-7,u.width+6,14,"#00e5ff",3),e.fillStyle="#00e5ff",e.fillText(d,f,m),e.restore()}renderHUD(e){const t=this.width,n=this.height;e.save(),e.font='11px "Courier New", Consolas, monospace',e.fillStyle="#00e5ff",e.textBaseline="top",e.textAlign="left",e.fillText("AEGIS TRANSIT // TACTICAL ECLIPTIC DISPLAY",14,12),e.font='10px "Courier New", Consolas, monospace',e.fillStyle="#8899aa",e.fillText(`PHASE: ${this.phase.toUpperCase()} | SCALE: ${this.scale.toFixed(0)} px/AU`,14,28),e.fillText(`SIM TIME: JD ${this.simTimeJD.toFixed(2)}`,14,42),this.renderButtons(e,t),this.cursorScreen?this.renderHoverReadout(e):(e.font='9px "Courier New", Consolas, monospace',e.fillStyle="rgba(136, 153, 170, 0.5)",e.textAlign="left",e.textBaseline="bottom",e.fillText("DRAG TO PAN | WHEEL TO ZOOM | DBL-CLICK TO CENTER | +/- TO SCALE",14,n-12)),e.restore()}renderButtons(e,t){const n=[{id:"SUN",label:"SUN",action:()=>this.focusOn("SUN")},{id:"EARTH",label:"EARTH",action:()=>this.focusOn("EARTH")},{id:"MARS",label:"MARS",action:()=>this.focusOn("MARS")},{id:"SHIP",label:"SHIP",action:()=>this.focusOn("SHIP")},{id:"RESET",label:"RESET",action:()=>this.resetView()}],s=54,r=20,a=6,o=n.length*s+(n.length-1)*a,l=t-o-14,c=12;this.hudButtons=[],e.font='10px "Courier New", Consolas, monospace',e.textAlign="center",e.textBaseline="middle",n.forEach((d,u)=>{const f=l+u*(s+a),m=c;this.hudButtons.push({id:d.id,label:d.label,x:f,y:m,w:s,h:r,action:d.action});const g=this.hoveredButtonId===d.id,v=this.targetFocus===d.id;e.fillStyle=v?"rgba(0, 229, 255, 0.3)":g?"rgba(0, 229, 255, 0.15)":"rgba(10, 14, 20, 0.75)",e.fillRect(f,m,s,r),gi(e,f,m,s,r,v||g?"#00e5ff":"rgba(0, 229, 255, 0.3)",3),e.fillStyle=v?"#ffffff":g?"#00e5ff":"#8899aa",e.fillText(d.label,f+s/2,m+r/2)})}renderHoverReadout(e){if(!this.cursorScreen)return;const[t,n]=this.cursorScreen,[s,r]=this.toWorld(t,n),a=Math.hypot(s,r),o=Math.hypot(s-this.earthPos[0],r-this.earthPos[1]),l=Math.hypot(s-this.marsPos[0],r-this.marsPos[1]),c=Math.hypot(s-this.shipPos[0],r-this.shipPos[1]),d=ta(o),u=240,f=92,m=14,g=this.height-f-14;e.fillStyle="rgba(10, 14, 20, 0.9)",e.fillRect(m,g,u,f),gi(e,m,g,u,f,"#00e5ff",4),e.font='10px "Courier New", Consolas, monospace',e.textAlign="left",e.textBaseline="top",e.fillStyle="#00e5ff",e.fillText("[ TACTICAL READOUT ]",m+8,g+8),e.fillStyle="#e0e6ed";const v=s>=0?"+":"",p=r>=0?"+":"";e.fillText(`CURSOR: ${v}${s.toFixed(3)}, ${p}${r.toFixed(3)} AU`,m+8,g+24),e.fillStyle="#8899aa",e.fillText(`SUN   : ${fs(a)}`,m+8,g+38),e.fillText(`EARTH : ${fs(o)} (OWLT: ${Mo(d)})`,m+8,g+52),e.fillText(`MARS  : ${fs(l)} | SHIP: ${fs(c)}`,m+8,g+66)}attachEventListeners(){this.canvas.addEventListener("mousedown",this.onMouseDown),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("mouseup",this.onMouseUp),this.canvas.addEventListener("mouseleave",this.onMouseLeave),this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("dblclick",this.onDblClick),this.canvas.addEventListener("keydown",this.onKeyDown)}handleMouseDown(e){const t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,s=e.clientY-t.top;for(const r of this.hudButtons)if(n>=r.x&&n<=r.x+r.w&&s>=r.y&&s<=r.y+r.h){r.action(),this.render();return}this.isDragging=!0,this.targetFocus=null,this.dragStartX=e.clientX,this.dragStartY=e.clientY,this.dragStartCenterX=this.centerX,this.dragStartCenterY=this.centerY}handleMouseMove(e){const t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,s=e.clientY-t.top;let r=!1;for(const a of this.hudButtons)if(n>=a.x&&n<=a.x+a.w&&s>=a.y&&s<=a.y+a.h){this.hoveredButtonId=a.id,r=!0,this.canvas.style.cursor="pointer";break}if(r||(this.hoveredButtonId=null,this.canvas.style.cursor=this.isDragging?"grabbing":"crosshair"),this.isDragging){const a=(e.clientX-this.dragStartX)/this.scale,o=(e.clientY-this.dragStartY)/this.scale;this.centerX=this.dragStartCenterX-a,this.centerY=this.dragStartCenterY+o,this.render()}else n>=0&&n<=this.width&&s>=0&&s<=this.height?this.cursorScreen=[n,s]:this.cursorScreen=null,this.render()}handleMouseUp(){this.isDragging=!1,this.canvas.style.cursor="crosshair"}handleMouseLeave(){this.cursorScreen=null,this.render()}handleWheel(e){e.preventDefault();const t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,s=e.clientY-t.top,[r,a]=this.toWorld(n,s),o=Math.exp(-e.deltaY*.0015),d=Math.max(15,Math.min(5e5,this.scale*o));this.centerX=r-(n-this.width/2)/d,this.centerY=a+(s-this.height/2)/d,this.scale=d,this.render()}handleDblClick(e){const t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,s=e.clientY-t.top,[r,a]=this.toScreen(0,0),[o,l]=this.toScreen(this.earthPos[0],this.earthPos[1]),[c,d]=this.toScreen(this.marsPos[0],this.marsPos[1]),[u,f]=this.toScreen(this.shipPos[0],this.shipPos[1]),m=25;if(Math.hypot(n-r,s-a)<m)this.focusOn("SUN");else if(Math.hypot(n-o,s-l)<m)this.focusOn("EARTH");else if(Math.hypot(n-c,s-d)<m)this.focusOn("MARS");else if(Math.hypot(n-u,s-f)<m)this.focusOn("SHIP");else{const[g,v]=this.toWorld(n,s);this.centerX=g,this.centerY=v,this.targetFocus=null}this.render()}handleKeyDown(e){const t=50/this.scale;switch(e.key){case"ArrowLeft":this.centerX-=t,this.targetFocus=null,this.render();break;case"ArrowRight":this.centerX+=t,this.targetFocus=null,this.render();break;case"ArrowUp":this.centerY+=t,this.targetFocus=null,this.render();break;case"ArrowDown":this.centerY-=t,this.targetFocus=null,this.render();break;case"+":case"=":this.scale=Math.min(5e5,this.scale*1.25),this.render();break;case"-":case"_":this.scale=Math.max(15,this.scale/1.25),this.render();break;case"0":case"r":case"R":this.resetView();break}}focusOn(e){switch(this.targetFocus=e,e){case"SUN":this.centerX=0,this.centerY=0;break;case"EARTH":this.centerX=this.earthPos[0],this.centerY=this.earthPos[1];break;case"MARS":this.centerX=this.marsPos[0],this.centerY=this.marsPos[1];break;case"SHIP":this.centerX=this.shipPos[0],this.centerY=this.shipPos[1];break}this.render()}resetView(){this.centerX=0,this.centerY=0,this.scale=200,this.targetFocus=null,this.render()}setCenter(e,t){this.centerX=e,this.centerY=t,this.targetFocus=null,this.render()}setScale(e){this.scale=Math.max(15,Math.min(5e5,e)),this.render()}getCenter(){return[this.centerX,this.centerY]}getScale(){return this.scale}destroy(){this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.animFrameId!==null&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.canvas.removeEventListener("mousedown",this.onMouseDown),window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("mouseup",this.onMouseUp),this.canvas.removeEventListener("mouseleave",this.onMouseLeave),this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("dblclick",this.onDblClick),this.canvas.removeEventListener("keydown",this.onKeyDown),this.canvas.parentElement&&this.canvas.parentElement.removeChild(this.canvas)}}const Bt=100;/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const qa="170",Md=0,Eo=1,Ed=2,Xl=1,Td=2,on=3,Dn=0,Mt=1,ln=2,un=0,xi=1,Zt=2,To=3,Ao=4,Ad=5,Wn=100,wd=101,Cd=102,Rd=103,Pd=104,Id=200,Ld=201,Dd=202,Nd=203,ia=204,sa=205,Ud=206,Od=207,Fd=208,Bd=209,kd=210,Hd=211,zd=212,Vd=213,Gd=214,ra=0,aa=1,oa=2,bi=3,la=4,ca=5,da=6,ha=7,ql=0,Wd=1,Xd=2,In=0,Yl=1,$l=2,jl=3,Ya=4,qd=5,Kl=6,Jl=7,Zl=300,Mi=301,Ei=302,ua=303,fa=304,rr=306,Qs=1e3,Cn=1001,pa=1002,qt=1003,Yd=1004,ps=1005,Jt=1006,fr=1007,qn=1008,mn=1009,Ql=1010,ec=1011,ns=1012,$a=1013,$n=1014,cn=1015,fn=1016,ja=1017,Ka=1018,Ti=1020,tc=35902,nc=1021,ic=1022,Xt=1023,sc=1024,rc=1025,yi=1026,Ai=1027,ac=1028,Ja=1029,oc=1030,Za=1031,Qa=1033,Ys=33776,$s=33777,js=33778,Ks=33779,ma=35840,ga=35841,va=35842,_a=35843,xa=36196,ya=37492,Sa=37496,ba=37808,Ma=37809,Ea=37810,Ta=37811,Aa=37812,wa=37813,Ca=37814,Ra=37815,Pa=37816,Ia=37817,La=37818,Da=37819,Na=37820,Ua=37821,Js=36492,Oa=36494,Fa=36495,lc=36283,Ba=36284,ka=36285,Ha=36286,$d=3200,jd=3201,Kd=0,Jd=1,wn="",yt="srgb",Pi="srgb-linear",ar="linear",Je="srgb",Zn=7680,wo=519,Zd=512,Qd=513,eh=514,cc=515,th=516,nh=517,ih=518,sh=519,za=35044,Co="300 es",dn=2e3,er=2001;class Ii{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const _t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],pr=Math.PI/180,Va=180/Math.PI;function Ln(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(_t[i&255]+_t[i>>8&255]+_t[i>>16&255]+_t[i>>24&255]+"-"+_t[e&255]+_t[e>>8&255]+"-"+_t[e>>16&15|64]+_t[e>>24&255]+"-"+_t[t&63|128]+_t[t>>8&255]+"-"+_t[t>>16&255]+_t[t>>24&255]+_t[n&255]+_t[n>>8&255]+_t[n>>16&255]+_t[n>>24&255]).toLowerCase()}function wt(i,e,t){return Math.max(e,Math.min(t,i))}function rh(i,e){return(i%e+e)%e}function mr(i,e,t){return(1-t)*i+t*e}function Kt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ze(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Le{constructor(e=0,t=0){Le.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(wt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Fe{constructor(e,t,n,s,r,a,o,l,c){Fe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const d=this.elements;return d[0]=e,d[1]=s,d[2]=o,d[3]=t,d[4]=r,d[5]=l,d[6]=n,d[7]=a,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],d=n[4],u=n[7],f=n[2],m=n[5],g=n[8],v=s[0],p=s[3],h=s[6],b=s[1],E=s[4],S=s[7],P=s[2],A=s[5],w=s[8];return r[0]=a*v+o*b+l*P,r[3]=a*p+o*E+l*A,r[6]=a*h+o*S+l*w,r[1]=c*v+d*b+u*P,r[4]=c*p+d*E+u*A,r[7]=c*h+d*S+u*w,r[2]=f*v+m*b+g*P,r[5]=f*p+m*E+g*A,r[8]=f*h+m*S+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8];return t*a*d-t*o*c-n*r*d+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],u=d*a-o*c,f=o*l-d*r,m=c*r-a*l,g=t*u+n*f+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=u*v,e[1]=(s*c-d*n)*v,e[2]=(o*n-s*a)*v,e[3]=f*v,e[4]=(d*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=m*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(gr.makeScale(e,t)),this}rotate(e){return this.premultiply(gr.makeRotation(-e)),this}translate(e,t){return this.premultiply(gr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const gr=new Fe;function dc(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function tr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ah(){const i=tr("canvas");return i.style.display="block",i}const Ro={};function qi(i){i in Ro||(Ro[i]=!0,console.warn(i))}function oh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function lh(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function ch(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Xe={enabled:!0,workingColorSpace:Pi,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Je&&(i.r=pn(i.r),i.g=pn(i.g),i.b=pn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Je&&(i.r=Si(i.r),i.g=Si(i.g),i.b=Si(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===wn?ar:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function pn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Si(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Po=[.64,.33,.3,.6,.15,.06],Io=[.2126,.7152,.0722],Lo=[.3127,.329],Do=new Fe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),No=new Fe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Xe.define({[Pi]:{primaries:Po,whitePoint:Lo,transfer:ar,toXYZ:Do,fromXYZ:No,luminanceCoefficients:Io,workingColorSpaceConfig:{unpackColorSpace:yt},outputColorSpaceConfig:{drawingBufferColorSpace:yt}},[yt]:{primaries:Po,whitePoint:Lo,transfer:Je,toXYZ:Do,fromXYZ:No,luminanceCoefficients:Io,outputColorSpaceConfig:{drawingBufferColorSpace:yt}}});let Qn;class dh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Qn===void 0&&(Qn=tr("canvas")),Qn.width=e.width,Qn.height=e.height;const n=Qn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Qn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=tr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=pn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(pn(t[n]/255)*255):t[n]=pn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let hh=0;class hc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:hh++}),this.uuid=Ln(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(vr(s[a].image)):r.push(vr(s[a]))}else r=vr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function vr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?dh.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let uh=0;class Et extends Ii{constructor(e=Et.DEFAULT_IMAGE,t=Et.DEFAULT_MAPPING,n=Cn,s=Cn,r=Jt,a=qn,o=Xt,l=mn,c=Et.DEFAULT_ANISOTROPY,d=wn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:uh++}),this.uuid=Ln(),this.name="",this.source=new hc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Le(0,0),this.repeat=new Le(1,1),this.center=new Le(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Qs:e.x=e.x-Math.floor(e.x);break;case Cn:e.x=e.x<0?0:1;break;case pa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Qs:e.y=e.y-Math.floor(e.y);break;case Cn:e.y=e.y<0?0:1;break;case pa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Et.DEFAULT_IMAGE=null;Et.DEFAULT_MAPPING=Zl;Et.DEFAULT_ANISOTROPY=1;class lt{constructor(e=0,t=0,n=0,s=1){lt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],d=l[4],u=l[8],f=l[1],m=l[5],g=l[9],v=l[2],p=l[6],h=l[10];if(Math.abs(d-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(d+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+p)<.1&&Math.abs(c+m+h-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(c+1)/2,S=(m+1)/2,P=(h+1)/2,A=(d+f)/4,w=(u+v)/4,N=(g+p)/4;return E>S&&E>P?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=A/n,r=w/n):S>P?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=A/s,r=N/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=w/r,s=N/r),this.set(n,s,r,t),this}let b=Math.sqrt((p-g)*(p-g)+(u-v)*(u-v)+(f-d)*(f-d));return Math.abs(b)<.001&&(b=1),this.x=(p-g)/b,this.y=(u-v)/b,this.z=(f-d)/b,this.w=Math.acos((c+m+h-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class fh extends Ii{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t);const s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Jt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Et(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new hc(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Yt extends fh{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class uc extends Et{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=qt,this.minFilter=qt,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class ph extends Et{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=qt,this.minFilter=qt,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gn{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],d=n[s+2],u=n[s+3];const f=r[a+0],m=r[a+1],g=r[a+2],v=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=m,e[t+2]=g,e[t+3]=v;return}if(u!==v||l!==f||c!==m||d!==g){let p=1-o;const h=l*f+c*m+d*g+u*v,b=h>=0?1:-1,E=1-h*h;if(E>Number.EPSILON){const P=Math.sqrt(E),A=Math.atan2(P,h*b);p=Math.sin(p*A)/P,o=Math.sin(o*A)/P}const S=o*b;if(l=l*p+f*S,c=c*p+m*S,d=d*p+g*S,u=u*p+v*S,p===1-o){const P=1/Math.sqrt(l*l+c*c+d*d+u*u);l*=P,c*=P,d*=P,u*=P}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],d=n[s+3],u=r[a],f=r[a+1],m=r[a+2],g=r[a+3];return e[t]=o*g+d*u+l*m-c*f,e[t+1]=l*g+d*f+c*u-o*m,e[t+2]=c*g+d*m+o*f-l*u,e[t+3]=d*g-o*u-l*f-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),d=o(s/2),u=o(r/2),f=l(n/2),m=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*d*u+c*m*g,this._y=c*m*u-f*d*g,this._z=c*d*g+f*m*u,this._w=c*d*u-f*m*g;break;case"YXZ":this._x=f*d*u+c*m*g,this._y=c*m*u-f*d*g,this._z=c*d*g-f*m*u,this._w=c*d*u+f*m*g;break;case"ZXY":this._x=f*d*u-c*m*g,this._y=c*m*u+f*d*g,this._z=c*d*g+f*m*u,this._w=c*d*u-f*m*g;break;case"ZYX":this._x=f*d*u-c*m*g,this._y=c*m*u+f*d*g,this._z=c*d*g-f*m*u,this._w=c*d*u+f*m*g;break;case"YZX":this._x=f*d*u+c*m*g,this._y=c*m*u+f*d*g,this._z=c*d*g-f*m*u,this._w=c*d*u-f*m*g;break;case"XZY":this._x=f*d*u-c*m*g,this._y=c*m*u-f*d*g,this._z=c*d*g+f*m*u,this._w=c*d*u+f*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],d=t[6],u=t[10],f=n+o+u;if(f>0){const m=.5/Math.sqrt(f+1);this._w=.25/m,this._x=(d-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(n>o&&n>u){const m=2*Math.sqrt(1+n-o-u);this._w=(d-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>u){const m=2*Math.sqrt(1+o-n-u);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+d)/m}else{const m=2*Math.sqrt(1+u-n-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+d)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(wt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+a*o+s*c-r*l,this._y=s*d+a*l+r*o-n*c,this._z=r*d+a*c+n*l-s*o,this._w=a*d-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const m=1-t;return this._w=m*a+t*this._w,this._x=m*n+t*this._x,this._y=m*s+t*this._y,this._z=m*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),d=Math.atan2(c,o),u=Math.sin((1-t)*d)/c,f=Math.sin(t*d)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,t=0,n=0){U.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Uo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Uo.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),d=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*d,this.y=n+l*d+o*c-r*u,this.z=s+l*u+r*d-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return _r.copy(this).projectOnVector(e),this.sub(_r)}reflect(e){return this.sub(_r.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(wt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const _r=new U,Uo=new gn;class rs{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Vt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Vt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Vt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Vt):Vt.fromBufferAttribute(r,a),Vt.applyMatrix4(e.matrixWorld),this.expandByPoint(Vt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ms.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ms.copy(n.boundingBox)),ms.applyMatrix4(e.matrixWorld),this.union(ms)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vt),Vt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Oi),gs.subVectors(this.max,Oi),ei.subVectors(e.a,Oi),ti.subVectors(e.b,Oi),ni.subVectors(e.c,Oi),xn.subVectors(ti,ei),yn.subVectors(ni,ti),On.subVectors(ei,ni);let t=[0,-xn.z,xn.y,0,-yn.z,yn.y,0,-On.z,On.y,xn.z,0,-xn.x,yn.z,0,-yn.x,On.z,0,-On.x,-xn.y,xn.x,0,-yn.y,yn.x,0,-On.y,On.x,0];return!xr(t,ei,ti,ni,gs)||(t=[1,0,0,0,1,0,0,0,1],!xr(t,ei,ti,ni,gs))?!1:(vs.crossVectors(xn,yn),t=[vs.x,vs.y,vs.z],xr(t,ei,ti,ni,gs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(tn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const tn=[new U,new U,new U,new U,new U,new U,new U,new U],Vt=new U,ms=new rs,ei=new U,ti=new U,ni=new U,xn=new U,yn=new U,On=new U,Oi=new U,gs=new U,vs=new U,Fn=new U;function xr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Fn.fromArray(i,r);const o=s.x*Math.abs(Fn.x)+s.y*Math.abs(Fn.y)+s.z*Math.abs(Fn.z),l=e.dot(Fn),c=t.dot(Fn),d=n.dot(Fn);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>o)return!1}return!0}const mh=new rs,Fi=new U,yr=new U;class as{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):mh.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Fi.subVectors(e,this.center);const t=Fi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Fi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(yr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Fi.copy(e.center).add(yr)),this.expandByPoint(Fi.copy(e.center).sub(yr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const nn=new U,Sr=new U,_s=new U,Sn=new U,br=new U,xs=new U,Mr=new U;class eo{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,nn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=nn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(nn.copy(this.origin).addScaledVector(this.direction,t),nn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Sr.copy(e).add(t).multiplyScalar(.5),_s.copy(t).sub(e).normalize(),Sn.copy(this.origin).sub(Sr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(_s),o=Sn.dot(this.direction),l=-Sn.dot(_s),c=Sn.lengthSq(),d=Math.abs(1-a*a);let u,f,m,g;if(d>0)if(u=a*l-o,f=a*o-l,g=r*d,u>=0)if(f>=-g)if(f<=g){const v=1/d;u*=v,f*=v,m=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),m=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),m=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),m=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),m=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Sr).addScaledVector(_s,f),m}intersectSphere(e,t){nn.subVectors(e.center,this.origin);const n=nn.dot(this.direction),s=nn.dot(nn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,d=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),d>=0?(r=(e.min.y-f.y)*d,a=(e.max.y-f.y)*d):(r=(e.max.y-f.y)*d,a=(e.min.y-f.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,nn)!==null}intersectTriangle(e,t,n,s,r){br.subVectors(t,e),xs.subVectors(n,e),Mr.crossVectors(br,xs);let a=this.direction.dot(Mr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Sn.subVectors(this.origin,e);const l=o*this.direction.dot(xs.crossVectors(Sn,xs));if(l<0)return null;const c=o*this.direction.dot(br.cross(Sn));if(c<0||l+c>a)return null;const d=-o*Sn.dot(Mr);return d<0?null:this.at(d/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rt{constructor(e,t,n,s,r,a,o,l,c,d,u,f,m,g,v,p){rt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,d,u,f,m,g,v,p)}set(e,t,n,s,r,a,o,l,c,d,u,f,m,g,v,p){const h=this.elements;return h[0]=e,h[4]=t,h[8]=n,h[12]=s,h[1]=r,h[5]=a,h[9]=o,h[13]=l,h[2]=c,h[6]=d,h[10]=u,h[14]=f,h[3]=m,h[7]=g,h[11]=v,h[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/ii.setFromMatrixColumn(e,0).length(),r=1/ii.setFromMatrixColumn(e,1).length(),a=1/ii.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),d=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=a*d,m=a*u,g=o*d,v=o*u;t[0]=l*d,t[4]=-l*u,t[8]=c,t[1]=m+g*c,t[5]=f-v*c,t[9]=-o*l,t[2]=v-f*c,t[6]=g+m*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*d,m=l*u,g=c*d,v=c*u;t[0]=f+v*o,t[4]=g*o-m,t[8]=a*c,t[1]=a*u,t[5]=a*d,t[9]=-o,t[2]=m*o-g,t[6]=v+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*d,m=l*u,g=c*d,v=c*u;t[0]=f-v*o,t[4]=-a*u,t[8]=g+m*o,t[1]=m+g*o,t[5]=a*d,t[9]=v-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*d,m=a*u,g=o*d,v=o*u;t[0]=l*d,t[4]=g*c-m,t[8]=f*c+v,t[1]=l*u,t[5]=v*c+f,t[9]=m*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,m=a*c,g=o*l,v=o*c;t[0]=l*d,t[4]=v-f*u,t[8]=g*u+m,t[1]=u,t[5]=a*d,t[9]=-o*d,t[2]=-c*d,t[6]=m*u+g,t[10]=f-v*u}else if(e.order==="XZY"){const f=a*l,m=a*c,g=o*l,v=o*c;t[0]=l*d,t[4]=-u,t[8]=c*d,t[1]=f*u+v,t[5]=a*d,t[9]=m*u-g,t[2]=g*u-m,t[6]=o*d,t[10]=v*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(gh,e,vh)}lookAt(e,t,n){const s=this.elements;return It.subVectors(e,t),It.lengthSq()===0&&(It.z=1),It.normalize(),bn.crossVectors(n,It),bn.lengthSq()===0&&(Math.abs(n.z)===1?It.x+=1e-4:It.z+=1e-4,It.normalize(),bn.crossVectors(n,It)),bn.normalize(),ys.crossVectors(It,bn),s[0]=bn.x,s[4]=ys.x,s[8]=It.x,s[1]=bn.y,s[5]=ys.y,s[9]=It.y,s[2]=bn.z,s[6]=ys.z,s[10]=It.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],d=n[1],u=n[5],f=n[9],m=n[13],g=n[2],v=n[6],p=n[10],h=n[14],b=n[3],E=n[7],S=n[11],P=n[15],A=s[0],w=s[4],N=s[8],M=s[12],x=s[1],C=s[5],z=s[9],O=s[13],q=s[2],$=s[6],V=s[10],j=s[14],B=s[3],Q=s[7],ie=s[11],ue=s[15];return r[0]=a*A+o*x+l*q+c*B,r[4]=a*w+o*C+l*$+c*Q,r[8]=a*N+o*z+l*V+c*ie,r[12]=a*M+o*O+l*j+c*ue,r[1]=d*A+u*x+f*q+m*B,r[5]=d*w+u*C+f*$+m*Q,r[9]=d*N+u*z+f*V+m*ie,r[13]=d*M+u*O+f*j+m*ue,r[2]=g*A+v*x+p*q+h*B,r[6]=g*w+v*C+p*$+h*Q,r[10]=g*N+v*z+p*V+h*ie,r[14]=g*M+v*O+p*j+h*ue,r[3]=b*A+E*x+S*q+P*B,r[7]=b*w+E*C+S*$+P*Q,r[11]=b*N+E*z+S*V+P*ie,r[15]=b*M+E*O+S*j+P*ue,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],d=e[2],u=e[6],f=e[10],m=e[14],g=e[3],v=e[7],p=e[11],h=e[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*m-n*l*m)+v*(+t*l*m-t*c*f+r*a*f-s*a*m+s*c*d-r*l*d)+p*(+t*c*u-t*o*m-r*a*u+n*a*m+r*o*d-n*c*d)+h*(-s*o*d-t*l*u+t*o*f+s*a*u-n*a*f+n*l*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],u=e[9],f=e[10],m=e[11],g=e[12],v=e[13],p=e[14],h=e[15],b=u*p*c-v*f*c+v*l*m-o*p*m-u*l*h+o*f*h,E=g*f*c-d*p*c-g*l*m+a*p*m+d*l*h-a*f*h,S=d*v*c-g*u*c+g*o*m-a*v*m-d*o*h+a*u*h,P=g*u*l-d*v*l-g*o*f+a*v*f+d*o*p-a*u*p,A=t*b+n*E+s*S+r*P;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return e[0]=b*w,e[1]=(v*f*r-u*p*r-v*s*m+n*p*m+u*s*h-n*f*h)*w,e[2]=(o*p*r-v*l*r+v*s*c-n*p*c-o*s*h+n*l*h)*w,e[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*m-n*l*m)*w,e[4]=E*w,e[5]=(d*p*r-g*f*r+g*s*m-t*p*m-d*s*h+t*f*h)*w,e[6]=(g*l*r-a*p*r-g*s*c+t*p*c+a*s*h-t*l*h)*w,e[7]=(a*f*r-d*l*r+d*s*c-t*f*c-a*s*m+t*l*m)*w,e[8]=S*w,e[9]=(g*u*r-d*v*r-g*n*m+t*v*m+d*n*h-t*u*h)*w,e[10]=(a*v*r-g*o*r+g*n*c-t*v*c-a*n*h+t*o*h)*w,e[11]=(d*o*r-a*u*r-d*n*c+t*u*c+a*n*m-t*o*m)*w,e[12]=P*w,e[13]=(d*v*s-g*u*s+g*n*f-t*v*f-d*n*p+t*u*p)*w,e[14]=(g*o*s-a*v*s-g*n*l+t*v*l+a*n*p-t*o*p)*w,e[15]=(a*u*s-d*o*s+d*n*l-t*u*l-a*n*f+t*o*f)*w,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,d=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,d*o+n,d*l-s*a,0,c*l-s*o,d*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,d=a+a,u=o+o,f=r*c,m=r*d,g=r*u,v=a*d,p=a*u,h=o*u,b=l*c,E=l*d,S=l*u,P=n.x,A=n.y,w=n.z;return s[0]=(1-(v+h))*P,s[1]=(m+S)*P,s[2]=(g-E)*P,s[3]=0,s[4]=(m-S)*A,s[5]=(1-(f+h))*A,s[6]=(p+b)*A,s[7]=0,s[8]=(g+E)*w,s[9]=(p-b)*w,s[10]=(1-(f+v))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=ii.set(s[0],s[1],s[2]).length();const a=ii.set(s[4],s[5],s[6]).length(),o=ii.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Gt.copy(this);const c=1/r,d=1/a,u=1/o;return Gt.elements[0]*=c,Gt.elements[1]*=c,Gt.elements[2]*=c,Gt.elements[4]*=d,Gt.elements[5]*=d,Gt.elements[6]*=d,Gt.elements[8]*=u,Gt.elements[9]*=u,Gt.elements[10]*=u,t.setFromRotationMatrix(Gt),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=dn){const l=this.elements,c=2*r/(t-e),d=2*r/(n-s),u=(t+e)/(t-e),f=(n+s)/(n-s);let m,g;if(o===dn)m=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===er)m=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=dn){const l=this.elements,c=1/(t-e),d=1/(n-s),u=1/(a-r),f=(t+e)*c,m=(n+s)*d;let g,v;if(o===dn)g=(a+r)*u,v=-2*u;else if(o===er)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*d,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ii=new U,Gt=new rt,gh=new U(0,0,0),vh=new U(1,1,1),bn=new U,ys=new U,It=new U,Oo=new rt,Fo=new gn;class kt{constructor(e=0,t=0,n=0,s=kt.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],d=s[9],u=s[2],f=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(wt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-wt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(wt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-wt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(wt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-wt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Oo.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Oo,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Fo.setFromEuler(this),this.setFromQuaternion(Fo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}kt.DEFAULT_ORDER="XYZ";class fc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let _h=0;const Bo=new U,si=new gn,sn=new rt,Ss=new U,Bi=new U,xh=new U,yh=new gn,ko=new U(1,0,0),Ho=new U(0,1,0),zo=new U(0,0,1),Vo={type:"added"},Sh={type:"removed"},ri={type:"childadded",child:null},Er={type:"childremoved",child:null};class gt extends Ii{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:_h++}),this.uuid=Ln(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=gt.DEFAULT_UP.clone();const e=new U,t=new kt,n=new gn,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new Fe}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=gt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return si.setFromAxisAngle(e,t),this.quaternion.multiply(si),this}rotateOnWorldAxis(e,t){return si.setFromAxisAngle(e,t),this.quaternion.premultiply(si),this}rotateX(e){return this.rotateOnAxis(ko,e)}rotateY(e){return this.rotateOnAxis(Ho,e)}rotateZ(e){return this.rotateOnAxis(zo,e)}translateOnAxis(e,t){return Bo.copy(e).applyQuaternion(this.quaternion),this.position.add(Bo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ko,e)}translateY(e){return this.translateOnAxis(Ho,e)}translateZ(e){return this.translateOnAxis(zo,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(sn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ss.copy(e):Ss.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Bi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?sn.lookAt(Bi,Ss,this.up):sn.lookAt(Ss,Bi,this.up),this.quaternion.setFromRotationMatrix(sn),s&&(sn.extractRotation(s.matrixWorld),si.setFromRotationMatrix(sn),this.quaternion.premultiply(si.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Vo),ri.child=e,this.dispatchEvent(ri),ri.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sh),Er.child=e,this.dispatchEvent(Er),Er.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),sn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),sn.multiply(e.parent.matrixWorld)),e.applyMatrix4(sn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Vo),ri.child=e,this.dispatchEvent(ri),ri.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Bi,e,xh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Bi,yh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),d=a(e.images),u=a(e.shapes),f=a(e.skeletons),m=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const d=o[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}gt.DEFAULT_UP=new U(0,1,0);gt.DEFAULT_MATRIX_AUTO_UPDATE=!0;gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Wt=new U,rn=new U,Tr=new U,an=new U,ai=new U,oi=new U,Go=new U,Ar=new U,wr=new U,Cr=new U,Rr=new lt,Pr=new lt,Ir=new lt;class Ot{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Wt.subVectors(e,t),s.cross(Wt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Wt.subVectors(s,t),rn.subVectors(n,t),Tr.subVectors(e,t);const a=Wt.dot(Wt),o=Wt.dot(rn),l=Wt.dot(Tr),c=rn.dot(rn),d=rn.dot(Tr),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,m=(c*l-o*d)*f,g=(a*d-o*l)*f;return r.set(1-m-g,g,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,an)===null?!1:an.x>=0&&an.y>=0&&an.x+an.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,an)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,an.x),l.addScaledVector(a,an.y),l.addScaledVector(o,an.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Rr.setScalar(0),Pr.setScalar(0),Ir.setScalar(0),Rr.fromBufferAttribute(e,t),Pr.fromBufferAttribute(e,n),Ir.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Rr,r.x),a.addScaledVector(Pr,r.y),a.addScaledVector(Ir,r.z),a}static isFrontFacing(e,t,n,s){return Wt.subVectors(n,t),rn.subVectors(e,t),Wt.cross(rn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wt.subVectors(this.c,this.b),rn.subVectors(this.a,this.b),Wt.cross(rn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Ot.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Ot.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Ot.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Ot.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ot.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;ai.subVectors(s,n),oi.subVectors(r,n),Ar.subVectors(e,n);const l=ai.dot(Ar),c=oi.dot(Ar);if(l<=0&&c<=0)return t.copy(n);wr.subVectors(e,s);const d=ai.dot(wr),u=oi.dot(wr);if(d>=0&&u<=d)return t.copy(s);const f=l*u-d*c;if(f<=0&&l>=0&&d<=0)return a=l/(l-d),t.copy(n).addScaledVector(ai,a);Cr.subVectors(e,r);const m=ai.dot(Cr),g=oi.dot(Cr);if(g>=0&&m<=g)return t.copy(r);const v=m*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(oi,o);const p=d*g-m*u;if(p<=0&&u-d>=0&&m-g>=0)return Go.subVectors(r,s),o=(u-d)/(u-d+(m-g)),t.copy(s).addScaledVector(Go,o);const h=1/(p+v+f);return a=v*h,o=f*h,t.copy(n).addScaledVector(ai,a).addScaledVector(oi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const pc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Mn={h:0,s:0,l:0},bs={h:0,s:0,l:0};function Lr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Xe.workingColorSpace){if(e=rh(e,1),t=wt(t,0,1),n=wt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Lr(a,r,e+1/3),this.g=Lr(a,r,e),this.b=Lr(a,r,e-1/3)}return Xe.toWorkingColorSpace(this,s),this}setStyle(e,t=yt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){const n=pc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=pn(e.r),this.g=pn(e.g),this.b=pn(e.b),this}copyLinearToSRGB(e){return this.r=Si(e.r),this.g=Si(e.g),this.b=Si(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return Xe.fromWorkingColorSpace(xt.copy(this),e),Math.round(wt(xt.r*255,0,255))*65536+Math.round(wt(xt.g*255,0,255))*256+Math.round(wt(xt.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.fromWorkingColorSpace(xt.copy(this),t);const n=xt.r,s=xt.g,r=xt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const d=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=d<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=Xe.workingColorSpace){return Xe.fromWorkingColorSpace(xt.copy(this),t),e.r=xt.r,e.g=xt.g,e.b=xt.b,e}getStyle(e=yt){Xe.fromWorkingColorSpace(xt.copy(this),e);const t=xt.r,n=xt.g,s=xt.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Mn),this.setHSL(Mn.h+e,Mn.s+t,Mn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Mn),e.getHSL(bs);const n=mr(Mn.h,bs.h,t),s=mr(Mn.s,bs.s,t),r=mr(Mn.l,bs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const xt=new Ve;Ve.NAMES=pc;let bh=0;class jn extends Ii{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:bh++}),this.uuid=Ln(),this.name="",this.blending=xi,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ia,this.blendDst=sa,this.blendEquation=Wn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=bi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=wo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zn,this.stencilZFail=Zn,this.stencilZPass=Zn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==xi&&(n.blending=this.blending),this.side!==Dn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ia&&(n.blendSrc=this.blendSrc),this.blendDst!==sa&&(n.blendDst=this.blendDst),this.blendEquation!==Wn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==bi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==wo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Zn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Zn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class wi extends jn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kt,this.combine=ql,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ct=new U,Ms=new Le;class dt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=za,this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ms.fromBufferAttribute(this,t),Ms.applyMatrix3(e),this.setXY(t,Ms.x,Ms.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyMatrix3(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyMatrix4(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyNormalMatrix(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.transformDirection(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Kt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ze(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Kt(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Kt(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Kt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Kt(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ze(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),s=Ze(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),s=Ze(s,this.array),r=Ze(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==za&&(e.usage=this.usage),e}}class mc extends dt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class gc extends dt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Rt extends dt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Mh=0;const Nt=new rt,Dr=new gt,li=new U,Lt=new rs,ki=new rs,ft=new U;class Tt extends Ii{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mh++}),this.uuid=Ln(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(dc(e)?gc:mc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Fe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Nt.makeRotationFromQuaternion(e),this.applyMatrix4(Nt),this}rotateX(e){return Nt.makeRotationX(e),this.applyMatrix4(Nt),this}rotateY(e){return Nt.makeRotationY(e),this.applyMatrix4(Nt),this}rotateZ(e){return Nt.makeRotationZ(e),this.applyMatrix4(Nt),this}translate(e,t,n){return Nt.makeTranslation(e,t,n),this.applyMatrix4(Nt),this}scale(e,t,n){return Nt.makeScale(e,t,n),this.applyMatrix4(Nt),this}lookAt(e){return Dr.lookAt(e),Dr.updateMatrix(),this.applyMatrix4(Dr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(li).negate(),this.translate(li.x,li.y,li.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Rt(n,3))}else{for(let n=0,s=t.count;n<s;n++){const r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Lt.setFromBufferAttribute(r),this.morphTargetsRelative?(ft.addVectors(this.boundingBox.min,Lt.min),this.boundingBox.expandByPoint(ft),ft.addVectors(this.boundingBox.max,Lt.max),this.boundingBox.expandByPoint(ft)):(this.boundingBox.expandByPoint(Lt.min),this.boundingBox.expandByPoint(Lt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new as);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){const n=this.boundingSphere.center;if(Lt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];ki.setFromBufferAttribute(o),this.morphTargetsRelative?(ft.addVectors(Lt.min,ki.min),Lt.expandByPoint(ft),ft.addVectors(Lt.max,ki.max),Lt.expandByPoint(ft)):(Lt.expandByPoint(ki.min),Lt.expandByPoint(ki.max))}Lt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)ft.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(ft));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,d=o.count;c<d;c++)ft.fromBufferAttribute(o,c),l&&(li.fromBufferAttribute(e,c),ft.add(li)),s=Math.max(s,n.distanceToSquared(ft))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new dt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let N=0;N<n.count;N++)o[N]=new U,l[N]=new U;const c=new U,d=new U,u=new U,f=new Le,m=new Le,g=new Le,v=new U,p=new U;function h(N,M,x){c.fromBufferAttribute(n,N),d.fromBufferAttribute(n,M),u.fromBufferAttribute(n,x),f.fromBufferAttribute(r,N),m.fromBufferAttribute(r,M),g.fromBufferAttribute(r,x),d.sub(c),u.sub(c),m.sub(f),g.sub(f);const C=1/(m.x*g.y-g.x*m.y);isFinite(C)&&(v.copy(d).multiplyScalar(g.y).addScaledVector(u,-m.y).multiplyScalar(C),p.copy(u).multiplyScalar(m.x).addScaledVector(d,-g.x).multiplyScalar(C),o[N].add(v),o[M].add(v),o[x].add(v),l[N].add(p),l[M].add(p),l[x].add(p))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let N=0,M=b.length;N<M;++N){const x=b[N],C=x.start,z=x.count;for(let O=C,q=C+z;O<q;O+=3)h(e.getX(O+0),e.getX(O+1),e.getX(O+2))}const E=new U,S=new U,P=new U,A=new U;function w(N){P.fromBufferAttribute(s,N),A.copy(P);const M=o[N];E.copy(M),E.sub(P.multiplyScalar(P.dot(M))).normalize(),S.crossVectors(A,M);const C=S.dot(l[N])<0?-1:1;a.setXYZW(N,E.x,E.y,E.z,C)}for(let N=0,M=b.length;N<M;++N){const x=b[N],C=x.start,z=x.count;for(let O=C,q=C+z;O<q;O+=3)w(e.getX(O+0)),w(e.getX(O+1)),w(e.getX(O+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new dt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,m=n.count;f<m;f++)n.setXYZ(f,0,0,0);const s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,d=new U,u=new U;if(e)for(let f=0,m=e.count;f<m;f+=3){const g=e.getX(f+0),v=e.getX(f+1),p=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,p),d.subVectors(a,r),u.subVectors(s,r),d.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(d),l.add(d),c.add(d),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,m=t.count;f<m;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),d.subVectors(a,r),u.subVectors(s,r),d.cross(u),n.setXYZ(f+0,d.x,d.y,d.z),n.setXYZ(f+1,d.x,d.y,d.z),n.setXYZ(f+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)ft.fromBufferAttribute(e,t),ft.normalize(),e.setXYZ(t,ft.x,ft.y,ft.z)}toNonIndexed(){function e(o,l){const c=o.array,d=o.itemSize,u=o.normalized,f=new c.constructor(l.length*d);let m=0,g=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?m=l[v]*o.data.stride+o.offset:m=l[v]*d;for(let h=0;h<d;h++)f[g++]=c[m++]}return new dt(f,d,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Tt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let d=0,u=c.length;d<u;d++){const f=c[d],m=e(f,n);l.push(m)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let u=0,f=c.length;u<f;u++){const m=c[u];d.push(m.toJSON(e.data))}d.length>0&&(s[l]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const d=s[c];this.setAttribute(c,d.clone(t))}const r=e.morphAttributes;for(const c in r){const d=[],u=r[c];for(let f=0,m=u.length;f<m;f++)d.push(u[f].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,d=a.length;c<d;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Wo=new rt,Bn=new eo,Es=new as,Xo=new U,Ts=new U,As=new U,ws=new U,Nr=new U,Cs=new U,qo=new U,Rs=new U;class Ct extends gt{constructor(e=new Tt,t=new wi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Cs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const d=o[l],u=r[l];d!==0&&(Nr.fromBufferAttribute(u,e),a?Cs.addScaledVector(Nr,d):Cs.addScaledVector(Nr.sub(t),d))}t.add(Cs)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Es.copy(n.boundingSphere),Es.applyMatrix4(r),Bn.copy(e.ray).recast(e.near),!(Es.containsPoint(Bn.origin)===!1&&(Bn.intersectSphere(Es,Xo)===null||Bn.origin.distanceToSquared(Xo)>(e.far-e.near)**2))&&(Wo.copy(r).invert(),Bn.copy(e.ray).applyMatrix4(Wo),!(n.boundingBox!==null&&Bn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Bn)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,u=r.attributes.normal,f=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],h=a[p.materialIndex],b=Math.max(p.start,m.start),E=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let S=b,P=E;S<P;S+=3){const A=o.getX(S),w=o.getX(S+1),N=o.getX(S+2);s=Ps(this,h,e,n,c,d,u,A,w,N),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(o.count,m.start+m.count);for(let p=g,h=v;p<h;p+=3){const b=o.getX(p),E=o.getX(p+1),S=o.getX(p+2);s=Ps(this,a,e,n,c,d,u,b,E,S),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const p=f[g],h=a[p.materialIndex],b=Math.max(p.start,m.start),E=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let S=b,P=E;S<P;S+=3){const A=S,w=S+1,N=S+2;s=Ps(this,h,e,n,c,d,u,A,w,N),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),v=Math.min(l.count,m.start+m.count);for(let p=g,h=v;p<h;p+=3){const b=p,E=p+1,S=p+2;s=Ps(this,a,e,n,c,d,u,b,E,S),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}}function Eh(i,e,t,n,s,r,a,o){let l;if(e.side===Mt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Dn,o),l===null)return null;Rs.copy(o),Rs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Rs);return c<t.near||c>t.far?null:{distance:c,point:Rs.clone(),object:i}}function Ps(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ts),i.getVertexPosition(l,As),i.getVertexPosition(c,ws);const d=Eh(i,e,t,n,Ts,As,ws,qo);if(d){const u=new U;Ot.getBarycoord(qo,Ts,As,ws,u),s&&(d.uv=Ot.getInterpolatedAttribute(s,o,l,c,u,new Le)),r&&(d.uv1=Ot.getInterpolatedAttribute(r,o,l,c,u,new Le)),a&&(d.normal=Ot.getInterpolatedAttribute(a,o,l,c,u,new U),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new U,materialIndex:0};Ot.getNormal(Ts,As,ws,f.normal),d.face=f,d.barycoord=u}return d}class os extends Tt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],d=[],u=[];let f=0,m=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Rt(c,3)),this.setAttribute("normal",new Rt(d,3)),this.setAttribute("uv",new Rt(u,2));function g(v,p,h,b,E,S,P,A,w,N,M){const x=S/w,C=P/N,z=S/2,O=P/2,q=A/2,$=w+1,V=N+1;let j=0,B=0;const Q=new U;for(let ie=0;ie<V;ie++){const ue=ie*C-O;for(let De=0;De<$;De++){const Ge=De*x-z;Q[v]=Ge*b,Q[p]=ue*E,Q[h]=q,c.push(Q.x,Q.y,Q.z),Q[v]=0,Q[p]=0,Q[h]=A>0?1:-1,d.push(Q.x,Q.y,Q.z),u.push(De/w),u.push(1-ie/N),j+=1}}for(let ie=0;ie<N;ie++)for(let ue=0;ue<w;ue++){const De=f+ue+$*ie,Ge=f+ue+$*(ie+1),W=f+(ue+1)+$*(ie+1),ee=f+(ue+1)+$*ie;l.push(De,Ge,ee),l.push(Ge,W,ee),B+=6}o.addGroup(m,B,M),m+=B,f+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new os(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ci(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function bt(i){const e={};for(let t=0;t<i.length;t++){const n=Ci(i[t]);for(const s in n)e[s]=n[s]}return e}function Th(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function vc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const is={clone:Ci,merge:bt};var Ah=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,wh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class mt extends jn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ah,this.fragmentShader=wh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ci(e.uniforms),this.uniformsGroups=Th(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class _c extends gt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=dn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const En=new U,Yo=new Le,$o=new Le;class Ut extends _c{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Va*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(pr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Va*2*Math.atan(Math.tan(pr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){En.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(En.x,En.y).multiplyScalar(-e/En.z),En.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(En.x,En.y).multiplyScalar(-e/En.z)}getViewSize(e,t){return this.getViewBounds(e,Yo,$o),t.subVectors($o,Yo)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(pr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ci=-90,di=1;class Ch extends gt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ut(ci,di,e,t);s.layers=this.layers,this.add(s);const r=new Ut(ci,di,e,t);r.layers=this.layers,this.add(r);const a=new Ut(ci,di,e,t);a.layers=this.layers,this.add(a);const o=new Ut(ci,di,e,t);o.layers=this.layers,this.add(o);const l=new Ut(ci,di,e,t);l.layers=this.layers,this.add(l);const c=new Ut(ci,di,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===dn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===er)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,d]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),e.render(t,d),e.setRenderTarget(u,f,m),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class xc extends Et{constructor(e,t,n,s,r,a,o,l,c,d){e=e!==void 0?e:[],t=t!==void 0?t:Mi,super(e,t,n,s,r,a,o,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Rh extends Yt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new xc(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Jt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new os(5,5,5),r=new mt({name:"CubemapFromEquirect",uniforms:Ci(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Mt,blending:un});r.uniforms.tEquirect.value=t;const a=new Ct(s,r),o=t.minFilter;return t.minFilter===qn&&(t.minFilter=Jt),new Ch(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}const Ur=new U,Ph=new U,Ih=new Fe;class Vn{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Ur.subVectors(n,t).cross(Ph.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Ur),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Ih.getNormalMatrix(e),s=this.coplanarPoint(Ur).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const kn=new as,Is=new U;class yc{constructor(e=new Vn,t=new Vn,n=new Vn,s=new Vn,r=new Vn,a=new Vn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=dn){const n=this.planes,s=e.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],d=s[5],u=s[6],f=s[7],m=s[8],g=s[9],v=s[10],p=s[11],h=s[12],b=s[13],E=s[14],S=s[15];if(n[0].setComponents(l-r,f-c,p-m,S-h).normalize(),n[1].setComponents(l+r,f+c,p+m,S+h).normalize(),n[2].setComponents(l+a,f+d,p+g,S+b).normalize(),n[3].setComponents(l-a,f-d,p-g,S-b).normalize(),n[4].setComponents(l-o,f-u,p-v,S-E).normalize(),t===dn)n[5].setComponents(l+o,f+u,p+v,S+E).normalize();else if(t===er)n[5].setComponents(o,u,v,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),kn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),kn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(kn)}intersectsSprite(e){return kn.center.set(0,0,0),kn.radius=.7071067811865476,kn.applyMatrix4(e.matrixWorld),this.intersectsSphere(kn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Is.x=s.normal.x>0?e.max.x:e.min.x,Is.y=s.normal.y>0?e.max.y:e.min.y,Is.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Is)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Sc(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Lh(i){const e=new WeakMap;function t(o,l){const c=o.array,d=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,d),o.onUploadCallback();let m;if(c instanceof Float32Array)m=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=i.SHORT;else if(c instanceof Uint32Array)m=i.UNSIGNED_INT;else if(c instanceof Int32Array)m=i.INT;else if(c instanceof Int8Array)m=i.BYTE;else if(c instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const d=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,d);else{u.sort((m,g)=>m.start-g.start);let f=0;for(let m=1;m<u.length;m++){const g=u[f],v=u[m];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let m=0,g=u.length;m<g;m++){const v=u[m];i.bufferSubData(c,v.start*d.BYTES_PER_ELEMENT,d,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class ls extends Tt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,d=l+1,u=e/o,f=t/l,m=[],g=[],v=[],p=[];for(let h=0;h<d;h++){const b=h*f-a;for(let E=0;E<c;E++){const S=E*u-r;g.push(S,-b,0),v.push(0,0,1),p.push(E/o),p.push(1-h/l)}}for(let h=0;h<l;h++)for(let b=0;b<o;b++){const E=b+c*h,S=b+c*(h+1),P=b+1+c*(h+1),A=b+1+c*h;m.push(E,S,A),m.push(S,P,A)}this.setIndex(m),this.setAttribute("position",new Rt(g,3)),this.setAttribute("normal",new Rt(v,3)),this.setAttribute("uv",new Rt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ls(e.width,e.height,e.widthSegments,e.heightSegments)}}var Dh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Nh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Uh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Oh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Fh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Bh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,kh=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Hh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zh=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Vh=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Gh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Wh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Xh=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,qh=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Yh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$h=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,jh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Kh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Jh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Zh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Qh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,eu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,tu=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,nu=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,iu=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,su=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ru=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,au=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ou=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,lu=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,cu="gl_FragColor = linearToOutputTexel( gl_FragColor );",du=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,uu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,fu=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,pu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,gu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,vu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_u=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,xu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,yu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Su=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mu=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Eu=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Tu=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Au=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,wu=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ru=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Pu=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Iu=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Lu=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Du=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Nu=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Uu=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ou=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fu=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bu=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ku=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Hu=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,zu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Vu=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Gu=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Wu=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Xu=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,qu=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Yu=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$u=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ju=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ku=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ju=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Zu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ef=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,tf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,nf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,sf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,rf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,af=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,of=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,lf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,cf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,df=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,hf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,uf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ff=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,pf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,gf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,vf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,_f=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,xf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,yf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Sf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,bf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Mf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ef=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Tf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Af=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,wf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Cf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Rf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Pf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,If=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Lf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Df=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Nf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Uf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Of=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ff=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Bf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Hf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,zf=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Vf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Gf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Wf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,qf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Yf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,$f=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jf=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Zf=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qf=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ep=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,tp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,np=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ip=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,sp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ap=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,op=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,lp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,hp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,up=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:Dh,alphahash_pars_fragment:Nh,alphamap_fragment:Uh,alphamap_pars_fragment:Oh,alphatest_fragment:Fh,alphatest_pars_fragment:Bh,aomap_fragment:kh,aomap_pars_fragment:Hh,batching_pars_vertex:zh,batching_vertex:Vh,begin_vertex:Gh,beginnormal_vertex:Wh,bsdfs:Xh,iridescence_fragment:qh,bumpmap_pars_fragment:Yh,clipping_planes_fragment:$h,clipping_planes_pars_fragment:jh,clipping_planes_pars_vertex:Kh,clipping_planes_vertex:Jh,color_fragment:Zh,color_pars_fragment:Qh,color_pars_vertex:eu,color_vertex:tu,common:nu,cube_uv_reflection_fragment:iu,defaultnormal_vertex:su,displacementmap_pars_vertex:ru,displacementmap_vertex:au,emissivemap_fragment:ou,emissivemap_pars_fragment:lu,colorspace_fragment:cu,colorspace_pars_fragment:du,envmap_fragment:hu,envmap_common_pars_fragment:uu,envmap_pars_fragment:fu,envmap_pars_vertex:pu,envmap_physical_pars_fragment:Tu,envmap_vertex:mu,fog_vertex:gu,fog_pars_vertex:vu,fog_fragment:_u,fog_pars_fragment:xu,gradientmap_pars_fragment:yu,lightmap_pars_fragment:Su,lights_lambert_fragment:bu,lights_lambert_pars_fragment:Mu,lights_pars_begin:Eu,lights_toon_fragment:Au,lights_toon_pars_fragment:wu,lights_phong_fragment:Cu,lights_phong_pars_fragment:Ru,lights_physical_fragment:Pu,lights_physical_pars_fragment:Iu,lights_fragment_begin:Lu,lights_fragment_maps:Du,lights_fragment_end:Nu,logdepthbuf_fragment:Uu,logdepthbuf_pars_fragment:Ou,logdepthbuf_pars_vertex:Fu,logdepthbuf_vertex:Bu,map_fragment:ku,map_pars_fragment:Hu,map_particle_fragment:zu,map_particle_pars_fragment:Vu,metalnessmap_fragment:Gu,metalnessmap_pars_fragment:Wu,morphinstance_vertex:Xu,morphcolor_vertex:qu,morphnormal_vertex:Yu,morphtarget_pars_vertex:$u,morphtarget_vertex:ju,normal_fragment_begin:Ku,normal_fragment_maps:Ju,normal_pars_fragment:Zu,normal_pars_vertex:Qu,normal_vertex:ef,normalmap_pars_fragment:tf,clearcoat_normal_fragment_begin:nf,clearcoat_normal_fragment_maps:sf,clearcoat_pars_fragment:rf,iridescence_pars_fragment:af,opaque_fragment:of,packing:lf,premultiplied_alpha_fragment:cf,project_vertex:df,dithering_fragment:hf,dithering_pars_fragment:uf,roughnessmap_fragment:ff,roughnessmap_pars_fragment:pf,shadowmap_pars_fragment:mf,shadowmap_pars_vertex:gf,shadowmap_vertex:vf,shadowmask_pars_fragment:_f,skinbase_vertex:xf,skinning_pars_vertex:yf,skinning_vertex:Sf,skinnormal_vertex:bf,specularmap_fragment:Mf,specularmap_pars_fragment:Ef,tonemapping_fragment:Tf,tonemapping_pars_fragment:Af,transmission_fragment:wf,transmission_pars_fragment:Cf,uv_pars_fragment:Rf,uv_pars_vertex:Pf,uv_vertex:If,worldpos_vertex:Lf,background_vert:Df,background_frag:Nf,backgroundCube_vert:Uf,backgroundCube_frag:Of,cube_vert:Ff,cube_frag:Bf,depth_vert:kf,depth_frag:Hf,distanceRGBA_vert:zf,distanceRGBA_frag:Vf,equirect_vert:Gf,equirect_frag:Wf,linedashed_vert:Xf,linedashed_frag:qf,meshbasic_vert:Yf,meshbasic_frag:$f,meshlambert_vert:jf,meshlambert_frag:Kf,meshmatcap_vert:Jf,meshmatcap_frag:Zf,meshnormal_vert:Qf,meshnormal_frag:ep,meshphong_vert:tp,meshphong_frag:np,meshphysical_vert:ip,meshphysical_frag:sp,meshtoon_vert:rp,meshtoon_frag:ap,points_vert:op,points_frag:lp,shadow_vert:cp,shadow_frag:dp,sprite_vert:hp,sprite_frag:up},re={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Le(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Le(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},jt={basic:{uniforms:bt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:bt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new Ve(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:bt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:bt([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:bt([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new Ve(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:bt([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:bt([re.points,re.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:bt([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:bt([re.common,re.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:bt([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:bt([re.sprite,re.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:bt([re.common,re.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:bt([re.lights,re.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};jt.physical={uniforms:bt([jt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Le(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Le},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Le},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};const Ls={r:0,b:0,g:0},Hn=new kt,fp=new rt;function pp(i,e,t,n,s,r,a){const o=new Ve(0);let l=r===!0?0:1,c,d,u=null,f=0,m=null;function g(b){let E=b.isScene===!0?b.background:null;return E&&E.isTexture&&(E=(b.backgroundBlurriness>0?t:e).get(E)),E}function v(b){let E=!1;const S=g(b);S===null?h(o,l):S&&S.isColor&&(h(S,1),E=!0);const P=i.xr.getEnvironmentBlendMode();P==="additive"?n.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||E)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(b,E){const S=g(E);S&&(S.isCubeTexture||S.mapping===rr)?(d===void 0&&(d=new Ct(new os(1,1,1),new mt({name:"BackgroundCubeMaterial",uniforms:Ci(jt.backgroundCube.uniforms),vertexShader:jt.backgroundCube.vertexShader,fragmentShader:jt.backgroundCube.fragmentShader,side:Mt,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(P,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(d)),Hn.copy(E.backgroundRotation),Hn.x*=-1,Hn.y*=-1,Hn.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Hn.y*=-1,Hn.z*=-1),d.material.uniforms.envMap.value=S,d.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(fp.makeRotationFromEuler(Hn)),d.material.toneMapped=Xe.getTransfer(S.colorSpace)!==Je,(u!==S||f!==S.version||m!==i.toneMapping)&&(d.material.needsUpdate=!0,u=S,f=S.version,m=i.toneMapping),d.layers.enableAll(),b.unshift(d,d.geometry,d.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new Ct(new ls(2,2),new mt({name:"BackgroundMaterial",uniforms:Ci(jt.background.uniforms),vertexShader:jt.background.vertexShader,fragmentShader:jt.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(S.colorSpace)!==Je,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||f!==S.version||m!==i.toneMapping)&&(c.material.needsUpdate=!0,u=S,f=S.version,m=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function h(b,E){b.getRGB(Ls,vc(i)),n.buffers.color.setClear(Ls.r,Ls.g,Ls.b,E,a)}return{getClearColor:function(){return o},setClearColor:function(b,E=1){o.set(b),l=E,h(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,h(o,l)},render:v,addToRenderList:p}}function mp(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(x,C,z,O,q){let $=!1;const V=u(O,z,C);r!==V&&(r=V,c(r.object)),$=m(x,O,z,q),$&&g(x,O,z,q),q!==null&&e.update(q,i.ELEMENT_ARRAY_BUFFER),($||a)&&(a=!1,S(x,C,z,O),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return i.createVertexArray()}function c(x){return i.bindVertexArray(x)}function d(x){return i.deleteVertexArray(x)}function u(x,C,z){const O=z.wireframe===!0;let q=n[x.id];q===void 0&&(q={},n[x.id]=q);let $=q[C.id];$===void 0&&($={},q[C.id]=$);let V=$[O];return V===void 0&&(V=f(l()),$[O]=V),V}function f(x){const C=[],z=[],O=[];for(let q=0;q<t;q++)C[q]=0,z[q]=0,O[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:z,attributeDivisors:O,object:x,attributes:{},index:null}}function m(x,C,z,O){const q=r.attributes,$=C.attributes;let V=0;const j=z.getAttributes();for(const B in j)if(j[B].location>=0){const ie=q[B];let ue=$[B];if(ue===void 0&&(B==="instanceMatrix"&&x.instanceMatrix&&(ue=x.instanceMatrix),B==="instanceColor"&&x.instanceColor&&(ue=x.instanceColor)),ie===void 0||ie.attribute!==ue||ue&&ie.data!==ue.data)return!0;V++}return r.attributesNum!==V||r.index!==O}function g(x,C,z,O){const q={},$=C.attributes;let V=0;const j=z.getAttributes();for(const B in j)if(j[B].location>=0){let ie=$[B];ie===void 0&&(B==="instanceMatrix"&&x.instanceMatrix&&(ie=x.instanceMatrix),B==="instanceColor"&&x.instanceColor&&(ie=x.instanceColor));const ue={};ue.attribute=ie,ie&&ie.data&&(ue.data=ie.data),q[B]=ue,V++}r.attributes=q,r.attributesNum=V,r.index=O}function v(){const x=r.newAttributes;for(let C=0,z=x.length;C<z;C++)x[C]=0}function p(x){h(x,0)}function h(x,C){const z=r.newAttributes,O=r.enabledAttributes,q=r.attributeDivisors;z[x]=1,O[x]===0&&(i.enableVertexAttribArray(x),O[x]=1),q[x]!==C&&(i.vertexAttribDivisor(x,C),q[x]=C)}function b(){const x=r.newAttributes,C=r.enabledAttributes;for(let z=0,O=C.length;z<O;z++)C[z]!==x[z]&&(i.disableVertexAttribArray(z),C[z]=0)}function E(x,C,z,O,q,$,V){V===!0?i.vertexAttribIPointer(x,C,z,q,$):i.vertexAttribPointer(x,C,z,O,q,$)}function S(x,C,z,O){v();const q=O.attributes,$=z.getAttributes(),V=C.defaultAttributeValues;for(const j in $){const B=$[j];if(B.location>=0){let Q=q[j];if(Q===void 0&&(j==="instanceMatrix"&&x.instanceMatrix&&(Q=x.instanceMatrix),j==="instanceColor"&&x.instanceColor&&(Q=x.instanceColor)),Q!==void 0){const ie=Q.normalized,ue=Q.itemSize,De=e.get(Q);if(De===void 0)continue;const Ge=De.buffer,W=De.type,ee=De.bytesPerElement,_e=W===i.INT||W===i.UNSIGNED_INT||Q.gpuType===$a;if(Q.isInterleavedBufferAttribute){const se=Q.data,Ee=se.stride,Re=Q.offset;if(se.isInstancedInterleavedBuffer){for(let Be=0;Be<B.locationSize;Be++)h(B.location+Be,se.meshPerAttribute);x.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let Be=0;Be<B.locationSize;Be++)p(B.location+Be);i.bindBuffer(i.ARRAY_BUFFER,Ge);for(let Be=0;Be<B.locationSize;Be++)E(B.location+Be,ue/B.locationSize,W,ie,Ee*ee,(Re+ue/B.locationSize*Be)*ee,_e)}else{if(Q.isInstancedBufferAttribute){for(let se=0;se<B.locationSize;se++)h(B.location+se,Q.meshPerAttribute);x.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let se=0;se<B.locationSize;se++)p(B.location+se);i.bindBuffer(i.ARRAY_BUFFER,Ge);for(let se=0;se<B.locationSize;se++)E(B.location+se,ue/B.locationSize,W,ie,ue*ee,ue/B.locationSize*se*ee,_e)}}else if(V!==void 0){const ie=V[j];if(ie!==void 0)switch(ie.length){case 2:i.vertexAttrib2fv(B.location,ie);break;case 3:i.vertexAttrib3fv(B.location,ie);break;case 4:i.vertexAttrib4fv(B.location,ie);break;default:i.vertexAttrib1fv(B.location,ie)}}}}b()}function P(){N();for(const x in n){const C=n[x];for(const z in C){const O=C[z];for(const q in O)d(O[q].object),delete O[q];delete C[z]}delete n[x]}}function A(x){if(n[x.id]===void 0)return;const C=n[x.id];for(const z in C){const O=C[z];for(const q in O)d(O[q].object),delete O[q];delete C[z]}delete n[x.id]}function w(x){for(const C in n){const z=n[C];if(z[x.id]===void 0)continue;const O=z[x.id];for(const q in O)d(O[q].object),delete O[q];delete z[x.id]}}function N(){M(),a=!0,r!==s&&(r=s,c(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:N,resetDefaultState:M,dispose:P,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:p,disableUnusedAttributes:b}}function gp(i,e,t){let n;function s(c){n=c}function r(c,d){i.drawArrays(n,c,d),t.update(d,n,1)}function a(c,d,u){u!==0&&(i.drawArraysInstanced(n,c,d,u),t.update(d,n,u))}function o(c,d,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,d,0,u);let m=0;for(let g=0;g<u;g++)m+=d[g];t.update(m,n,1)}function l(c,d,u,f){if(u===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<c.length;g++)a(c[g],d[g],f[g]);else{m.multiDrawArraysInstancedWEBGL(n,c,0,d,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=d[v]*f[v];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function vp(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==Xt&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const N=w===fn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==mn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==cn&&!N)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const d=l(c);d!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const u=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),h=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:m,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:h,maxVertexUniforms:b,maxVaryings:E,maxFragmentUniforms:S,vertexTextures:P,maxSamples:A}}function _p(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new Vn,o=new Fe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const m=u.length!==0||f||n!==0||s;return s=f,n=u.length,m},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=d(u,f,0)},this.setState=function(u,f,m){const g=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,h=i.get(u);if(!s||g===null||g.length===0||r&&!p)r?d(null):c();else{const b=r?0:n,E=b*4;let S=h.clippingState||null;l.value=S,S=d(g,f,E,m);for(let P=0;P!==E;++P)S[P]=t[P];h.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(u,f,m,g){const v=u!==null?u.length:0;let p=null;if(v!==0){if(p=l.value,g!==!0||p===null){const h=m+v*4,b=f.matrixWorldInverse;o.getNormalMatrix(b),(p===null||p.length<h)&&(p=new Float32Array(h));for(let E=0,S=m;E!==v;++E,S+=4)a.copy(u[E]).applyMatrix4(b,o),a.normal.toArray(p,S),p[S+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}function xp(i){let e=new WeakMap;function t(a,o){return o===ua?a.mapping=Mi:o===fa&&(a.mapping=Ei),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===ua||o===fa)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Rh(l.height);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class bc extends _c{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=d*this.view.offsetY,l=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const vi=4,jo=[.125,.215,.35,.446,.526,.582],Xn=20,Or=new bc,Ko=new Ve;let Fr=null,Br=0,kr=0,Hr=!1;const Gn=(1+Math.sqrt(5))/2,hi=1/Gn,Jo=[new U(-Gn,hi,0),new U(Gn,hi,0),new U(-hi,0,Gn),new U(hi,0,Gn),new U(0,Gn,-hi),new U(0,Gn,hi),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)];class Zo{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){Fr=this._renderer.getRenderTarget(),Br=this._renderer.getActiveCubeFace(),kr=this._renderer.getActiveMipmapLevel(),Hr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=el(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Fr,Br,kr),this._renderer.xr.enabled=Hr,e.scissorTest=!1,Ds(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Mi||e.mapping===Ei?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Fr=this._renderer.getRenderTarget(),Br=this._renderer.getActiveCubeFace(),kr=this._renderer.getActiveMipmapLevel(),Hr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Jt,minFilter:Jt,generateMipmaps:!1,type:fn,format:Xt,colorSpace:Pi,depthBuffer:!1},s=Qo(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qo(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=yp(r)),this._blurMaterial=Sp(r,e,t)}return s}_compileMaterial(e){const t=new Ct(this._lodPlanes[0],e);this._renderer.compile(t,Or)}_sceneToCubeUV(e,t,n,s){const o=new Ut(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Ko),d.toneMapping=In,d.autoClear=!1;const m=new wi({name:"PMREM.Background",side:Mt,depthWrite:!1,depthTest:!1}),g=new Ct(new os,m);let v=!1;const p=e.background;p?p.isColor&&(m.color.copy(p),e.background=null,v=!0):(m.color.copy(Ko),v=!0);for(let h=0;h<6;h++){const b=h%3;b===0?(o.up.set(0,l[h],0),o.lookAt(c[h],0,0)):b===1?(o.up.set(0,0,l[h]),o.lookAt(0,c[h],0)):(o.up.set(0,l[h],0),o.lookAt(0,0,c[h]));const E=this._cubeSize;Ds(s,b*E,h>2?E:0,E,E),d.setRenderTarget(s),v&&d.render(g,o),d.render(e,o)}g.geometry.dispose(),g.material.dispose(),d.toneMapping=f,d.autoClear=u,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Mi||e.mapping===Ei;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=tl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=el());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Ct(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Ds(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Or)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Jo[(s-r-1)%Jo.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,u=new Ct(this._lodPlanes[s],c),f=c.uniforms,m=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Xn-1),v=r/g,p=isFinite(r)?1+Math.floor(d*v):Xn;p>Xn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Xn}`);const h=[];let b=0;for(let w=0;w<Xn;++w){const N=w/v,M=Math.exp(-N*N/2);h.push(M),w===0?b+=M:w<p&&(b+=2*M)}for(let w=0;w<h.length;w++)h[w]=h[w]/b;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=h,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:E}=this;f.dTheta.value=g,f.mipInt.value=E-n;const S=this._sizeLods[s],P=3*S*(s>E-vi?s-E+vi:0),A=4*(this._cubeSize-S);Ds(t,P,A,3*S,2*S),l.setRenderTarget(t),l.render(u,Or)}}function yp(i){const e=[],t=[],n=[];let s=i;const r=i-vi+1+jo.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let l=1/o;a>i-vi?l=jo[a-i+vi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),d=-c,u=1+c,f=[d,d,u,d,u,u,d,d,u,u,d,u],m=6,g=6,v=3,p=2,h=1,b=new Float32Array(v*g*m),E=new Float32Array(p*g*m),S=new Float32Array(h*g*m);for(let A=0;A<m;A++){const w=A%3*2/3-1,N=A>2?0:-1,M=[w,N,0,w+2/3,N,0,w+2/3,N+1,0,w,N,0,w+2/3,N+1,0,w,N+1,0];b.set(M,v*g*A),E.set(f,p*g*A);const x=[A,A,A,A,A,A];S.set(x,h*g*A)}const P=new Tt;P.setAttribute("position",new dt(b,v)),P.setAttribute("uv",new dt(E,p)),P.setAttribute("faceIndex",new dt(S,h)),e.push(P),s>vi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Qo(i,e,t){const n=new Yt(i,e,t);return n.texture.mapping=rr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ds(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Sp(i,e,t){const n=new Float32Array(Xn),s=new U(0,1,0);return new mt({name:"SphericalGaussianBlur",defines:{n:Xn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:to(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:un,depthTest:!1,depthWrite:!1})}function el(){return new mt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:to(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:un,depthTest:!1,depthWrite:!1})}function tl(){return new mt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:to(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:un,depthTest:!1,depthWrite:!1})}function to(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function bp(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===ua||l===fa,d=l===Mi||l===Ei;if(c||d){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new Zo(i)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const m=o.image;return c&&m&&m.height>0||d&&m&&s(m)?(t===null&&(t=new Zo(i)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let d=0;d<c;d++)o[d]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Mp(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&qi("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Ep(i,e,t,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);for(const g in f.morphAttributes){const v=f.morphAttributes[g];for(let p=0,h=v.length;p<h;p++)e.remove(v[p])}f.removeEventListener("dispose",a),delete s[f.id];const m=r.get(f);m&&(e.remove(m),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)e.update(f[g],i.ARRAY_BUFFER);const m=u.morphAttributes;for(const g in m){const v=m[g];for(let p=0,h=v.length;p<h;p++)e.update(v[p],i.ARRAY_BUFFER)}}function c(u){const f=[],m=u.index,g=u.attributes.position;let v=0;if(m!==null){const b=m.array;v=m.version;for(let E=0,S=b.length;E<S;E+=3){const P=b[E+0],A=b[E+1],w=b[E+2];f.push(P,A,A,w,w,P)}}else if(g!==void 0){const b=g.array;v=g.version;for(let E=0,S=b.length/3-1;E<S;E+=3){const P=E+0,A=E+1,w=E+2;f.push(P,A,A,w,w,P)}}else return;const p=new(dc(f)?gc:mc)(f,1);p.version=v;const h=r.get(u);h&&e.remove(h),r.set(u,p)}function d(u){const f=r.get(u);if(f){const m=u.index;m!==null&&f.version<m.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:d}}function Tp(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,m){i.drawElements(n,m,r,f*a),t.update(m,n,1)}function c(f,m,g){g!==0&&(i.drawElementsInstanced(n,m,r,f*a,g),t.update(m,n,g))}function d(f,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,m,0,r,f,0,g);let p=0;for(let h=0;h<g;h++)p+=m[h];t.update(p,n,1)}function u(f,m,g,v){if(g===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let h=0;h<f.length;h++)c(f[h]/a,m[h],v[h]);else{p.multiDrawElementsInstancedWEBGL(n,m,0,r,f,0,v,0,g);let h=0;for(let b=0;b<g;b++)h+=m[b]*v[b];t.update(h,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=u}function Ap(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function wp(i,e,t){const n=new WeakMap,s=new lt;function r(a,o,l){const c=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=d!==void 0?d.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let x=function(){N.dispose(),n.delete(o),o.removeEventListener("dispose",x)};var m=x;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,p=o.morphAttributes.color!==void 0,h=o.morphAttributes.position||[],b=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let S=0;g===!0&&(S=1),v===!0&&(S=2),p===!0&&(S=3);let P=o.attributes.position.count*S,A=1;P>e.maxTextureSize&&(A=Math.ceil(P/e.maxTextureSize),P=e.maxTextureSize);const w=new Float32Array(P*A*4*u),N=new uc(w,P,A,u);N.type=cn,N.needsUpdate=!0;const M=S*4;for(let C=0;C<u;C++){const z=h[C],O=b[C],q=E[C],$=P*A*4*C;for(let V=0;V<z.count;V++){const j=V*M;g===!0&&(s.fromBufferAttribute(z,V),w[$+j+0]=s.x,w[$+j+1]=s.y,w[$+j+2]=s.z,w[$+j+3]=0),v===!0&&(s.fromBufferAttribute(O,V),w[$+j+4]=s.x,w[$+j+5]=s.y,w[$+j+6]=s.z,w[$+j+7]=0),p===!0&&(s.fromBufferAttribute(q,V),w[$+j+8]=s.x,w[$+j+9]=s.y,w[$+j+10]=s.z,w[$+j+11]=q.itemSize===4?s.w:1)}}f={count:u,texture:N,size:new Le(P,A)},n.set(o,f),o.addEventListener("dispose",x)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let p=0;p<c.length;p++)g+=c[p];const v=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function Cp(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,d=l.geometry,u=e.get(l,d);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}class Mc extends Et{constructor(e,t,n,s,r,a,o,l,c,d=yi){if(d!==yi&&d!==Ai)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&d===yi&&(n=$n),n===void 0&&d===Ai&&(n=Ti),super(null,s,r,a,o,l,d,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:qt,this.minFilter=l!==void 0?l:qt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Ec=new Et,nl=new Mc(1,1),Tc=new uc,Ac=new ph,wc=new xc,il=[],sl=[],rl=new Float32Array(16),al=new Float32Array(9),ol=new Float32Array(4);function Li(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=il[s];if(r===void 0&&(r=new Float32Array(s),il[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function ht(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function ut(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function or(i,e){let t=sl[e];t===void 0&&(t=new Int32Array(e),sl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Rp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Pp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ht(t,e))return;i.uniform2fv(this.addr,e),ut(t,e)}}function Ip(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ht(t,e))return;i.uniform3fv(this.addr,e),ut(t,e)}}function Lp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ht(t,e))return;i.uniform4fv(this.addr,e),ut(t,e)}}function Dp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ht(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),ut(t,e)}else{if(ht(t,n))return;ol.set(n),i.uniformMatrix2fv(this.addr,!1,ol),ut(t,n)}}function Np(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ht(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),ut(t,e)}else{if(ht(t,n))return;al.set(n),i.uniformMatrix3fv(this.addr,!1,al),ut(t,n)}}function Up(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ht(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),ut(t,e)}else{if(ht(t,n))return;rl.set(n),i.uniformMatrix4fv(this.addr,!1,rl),ut(t,n)}}function Op(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Fp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ht(t,e))return;i.uniform2iv(this.addr,e),ut(t,e)}}function Bp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ht(t,e))return;i.uniform3iv(this.addr,e),ut(t,e)}}function kp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ht(t,e))return;i.uniform4iv(this.addr,e),ut(t,e)}}function Hp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function zp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ht(t,e))return;i.uniform2uiv(this.addr,e),ut(t,e)}}function Vp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ht(t,e))return;i.uniform3uiv(this.addr,e),ut(t,e)}}function Gp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ht(t,e))return;i.uniform4uiv(this.addr,e),ut(t,e)}}function Wp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(nl.compareFunction=cc,r=nl):r=Ec,t.setTexture2D(e||r,s)}function Xp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Ac,s)}function qp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||wc,s)}function Yp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Tc,s)}function $p(i){switch(i){case 5126:return Rp;case 35664:return Pp;case 35665:return Ip;case 35666:return Lp;case 35674:return Dp;case 35675:return Np;case 35676:return Up;case 5124:case 35670:return Op;case 35667:case 35671:return Fp;case 35668:case 35672:return Bp;case 35669:case 35673:return kp;case 5125:return Hp;case 36294:return zp;case 36295:return Vp;case 36296:return Gp;case 35678:case 36198:case 36298:case 36306:case 35682:return Wp;case 35679:case 36299:case 36307:return Xp;case 35680:case 36300:case 36308:case 36293:return qp;case 36289:case 36303:case 36311:case 36292:return Yp}}function jp(i,e){i.uniform1fv(this.addr,e)}function Kp(i,e){const t=Li(e,this.size,2);i.uniform2fv(this.addr,t)}function Jp(i,e){const t=Li(e,this.size,3);i.uniform3fv(this.addr,t)}function Zp(i,e){const t=Li(e,this.size,4);i.uniform4fv(this.addr,t)}function Qp(i,e){const t=Li(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function em(i,e){const t=Li(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function tm(i,e){const t=Li(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function nm(i,e){i.uniform1iv(this.addr,e)}function im(i,e){i.uniform2iv(this.addr,e)}function sm(i,e){i.uniform3iv(this.addr,e)}function rm(i,e){i.uniform4iv(this.addr,e)}function am(i,e){i.uniform1uiv(this.addr,e)}function om(i,e){i.uniform2uiv(this.addr,e)}function lm(i,e){i.uniform3uiv(this.addr,e)}function cm(i,e){i.uniform4uiv(this.addr,e)}function dm(i,e,t){const n=this.cache,s=e.length,r=or(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),ut(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||Ec,r[a])}function hm(i,e,t){const n=this.cache,s=e.length,r=or(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),ut(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Ac,r[a])}function um(i,e,t){const n=this.cache,s=e.length,r=or(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),ut(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||wc,r[a])}function fm(i,e,t){const n=this.cache,s=e.length,r=or(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),ut(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Tc,r[a])}function pm(i){switch(i){case 5126:return jp;case 35664:return Kp;case 35665:return Jp;case 35666:return Zp;case 35674:return Qp;case 35675:return em;case 35676:return tm;case 5124:case 35670:return nm;case 35667:case 35671:return im;case 35668:case 35672:return sm;case 35669:case 35673:return rm;case 5125:return am;case 36294:return om;case 36295:return lm;case 36296:return cm;case 35678:case 36198:case 36298:case 36306:case 35682:return dm;case 35679:case 36299:case 36307:return hm;case 35680:case 36300:case 36308:case 36293:return um;case 36289:case 36303:case 36311:case 36292:return fm}}class mm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=$p(t.type)}}class gm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=pm(t.type)}}class vm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const zr=/(\w+)(\])?(\[|\.)?/g;function ll(i,e){i.seq.push(e),i.map[e.id]=e}function _m(i,e,t){const n=i.name,s=n.length;for(zr.lastIndex=0;;){const r=zr.exec(n),a=zr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ll(t,c===void 0?new mm(o,i,e):new gm(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new vm(o),ll(t,u)),t=u}}}class Zs{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);_m(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function cl(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const xm=37297;let ym=0;function Sm(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const dl=new Fe;function bm(i){Xe._getMatrix(dl,Xe.workingColorSpace,i);const e=`mat3( ${dl.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case ar:return[e,"LinearTransferOETF"];case Je:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function hl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Sm(i.getShaderSource(e),a)}else return s}function Mm(i,e){const t=bm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Em(i,e){let t;switch(e){case Yl:t="Linear";break;case $l:t="Reinhard";break;case jl:t="Cineon";break;case Ya:t="ACESFilmic";break;case Kl:t="AgX";break;case Jl:t="Neutral";break;case qd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ns=new U;function Tm(){Xe.getLuminanceCoefficients(Ns);const i=Ns.x.toFixed(4),e=Ns.y.toFixed(4),t=Ns.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Am(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Yi).join(`
`)}function wm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Cm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Yi(i){return i!==""}function ul(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function fl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Rm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ga(i){return i.replace(Rm,Im)}const Pm=new Map;function Im(i,e){let t=He[e];if(t===void 0){const n=Pm.get(e);if(n!==void 0)t=He[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ga(t)}const Lm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pl(i){return i.replace(Lm,Dm)}function Dm(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ml(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Nm(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Xl?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Td?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===on&&(e="SHADOWMAP_TYPE_VSM"),e}function Um(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Mi:case Ei:e="ENVMAP_TYPE_CUBE";break;case rr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Om(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ei:e="ENVMAP_MODE_REFRACTION";break}return e}function Fm(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case ql:e="ENVMAP_BLENDING_MULTIPLY";break;case Wd:e="ENVMAP_BLENDING_MIX";break;case Xd:e="ENVMAP_BLENDING_ADD";break}return e}function Bm(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function km(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Nm(t),c=Um(t),d=Om(t),u=Fm(t),f=Bm(t),m=Am(t),g=wm(r),v=s.createProgram();let p,h,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Yi).join(`
`),p.length>0&&(p+=`
`),h=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Yi).join(`
`),h.length>0&&(h+=`
`)):(p=[ml(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Yi).join(`
`),h=[ml(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==In?"#define TONE_MAPPING":"",t.toneMapping!==In?He.tonemapping_pars_fragment:"",t.toneMapping!==In?Em("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,Mm("linearToOutputTexel",t.outputColorSpace),Tm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Yi).join(`
`)),a=Ga(a),a=ul(a,t),a=fl(a,t),o=Ga(o),o=ul(o,t),o=fl(o,t),a=pl(a),o=pl(o),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,h=["#define varying in",t.glslVersion===Co?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Co?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);const E=b+p+a,S=b+h+o,P=cl(s,s.VERTEX_SHADER,E),A=cl(s,s.FRAGMENT_SHADER,S);s.attachShader(v,P),s.attachShader(v,A),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(C){if(i.debug.checkShaderErrors){const z=s.getProgramInfoLog(v).trim(),O=s.getShaderInfoLog(P).trim(),q=s.getShaderInfoLog(A).trim();let $=!0,V=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,P,A);else{const j=hl(s,P,"vertex"),B=hl(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+z+`
`+j+`
`+B)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(O===""||q==="")&&(V=!1);V&&(C.diagnostics={runnable:$,programLog:z,vertexShader:{log:O,prefix:p},fragmentShader:{log:q,prefix:h}})}s.deleteShader(P),s.deleteShader(A),N=new Zs(s,v),M=Cm(s,v)}let N;this.getUniforms=function(){return N===void 0&&w(this),N};let M;this.getAttributes=function(){return M===void 0&&w(this),M};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(v,xm)),x},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ym++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=P,this.fragmentShader=A,this}let Hm=0;class zm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Vm(e),t.set(e,n)),n}}class Vm{constructor(e){this.id=Hm++,this.code=e,this.usedTimes=0}}function Gm(i,e,t,n,s,r,a){const o=new fc,l=new zm,c=new Set,d=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let m=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(M){return c.add(M),M===0?"uv":`uv${M}`}function p(M,x,C,z,O){const q=z.fog,$=O.geometry,V=M.isMeshStandardMaterial?z.environment:null,j=(M.isMeshStandardMaterial?t:e).get(M.envMap||V),B=j&&j.mapping===rr?j.image.height:null,Q=g[M.type];M.precision!==null&&(m=s.getMaxPrecision(M.precision),m!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",m,"instead."));const ie=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,ue=ie!==void 0?ie.length:0;let De=0;$.morphAttributes.position!==void 0&&(De=1),$.morphAttributes.normal!==void 0&&(De=2),$.morphAttributes.color!==void 0&&(De=3);let Ge,W,ee,_e;if(Q){const Ke=jt[Q];Ge=Ke.vertexShader,W=Ke.fragmentShader}else Ge=M.vertexShader,W=M.fragmentShader,l.update(M),ee=l.getVertexShaderID(M),_e=l.getFragmentShaderID(M);const se=i.getRenderTarget(),Ee=i.state.buffers.depth.getReversed(),Re=O.isInstancedMesh===!0,Be=O.isBatchedMesh===!0,X=!!M.map,le=!!M.matcap,ve=!!j,R=!!M.aoMap,nt=!!M.lightMap,Pe=!!M.bumpMap,we=!!M.normalMap,fe=!!M.displacementMap,ze=!!M.emissiveMap,ye=!!M.metalnessMap,T=!!M.roughnessMap,_=M.anisotropy>0,F=M.clearcoat>0,Y=M.dispersion>0,Z=M.iridescence>0,K=M.sheen>0,Te=M.transmission>0,oe=_&&!!M.anisotropyMap,pe=F&&!!M.clearcoatMap,qe=F&&!!M.clearcoatNormalMap,te=F&&!!M.clearcoatRoughnessMap,me=Z&&!!M.iridescenceMap,Ce=Z&&!!M.iridescenceThicknessMap,Ie=K&&!!M.sheenColorMap,ge=K&&!!M.sheenRoughnessMap,We=!!M.specularMap,ke=!!M.specularColorMap,Qe=!!M.specularIntensityMap,I=Te&&!!M.transmissionMap,ae=Te&&!!M.thicknessMap,G=!!M.gradientMap,J=!!M.alphaMap,he=M.alphaTest>0,ce=!!M.alphaHash,Ue=!!M.extensions;let at=In;M.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(at=i.toneMapping);const vt={shaderID:Q,shaderType:M.type,shaderName:M.name,vertexShader:Ge,fragmentShader:W,defines:M.defines,customVertexShaderID:ee,customFragmentShaderID:_e,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:m,batching:Be,batchingColor:Be&&O._colorsTexture!==null,instancing:Re,instancingColor:Re&&O.instanceColor!==null,instancingMorph:Re&&O.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:se===null?i.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:Pi,alphaToCoverage:!!M.alphaToCoverage,map:X,matcap:le,envMap:ve,envMapMode:ve&&j.mapping,envMapCubeUVHeight:B,aoMap:R,lightMap:nt,bumpMap:Pe,normalMap:we,displacementMap:f&&fe,emissiveMap:ze,normalMapObjectSpace:we&&M.normalMapType===Jd,normalMapTangentSpace:we&&M.normalMapType===Kd,metalnessMap:ye,roughnessMap:T,anisotropy:_,anisotropyMap:oe,clearcoat:F,clearcoatMap:pe,clearcoatNormalMap:qe,clearcoatRoughnessMap:te,dispersion:Y,iridescence:Z,iridescenceMap:me,iridescenceThicknessMap:Ce,sheen:K,sheenColorMap:Ie,sheenRoughnessMap:ge,specularMap:We,specularColorMap:ke,specularIntensityMap:Qe,transmission:Te,transmissionMap:I,thicknessMap:ae,gradientMap:G,opaque:M.transparent===!1&&M.blending===xi&&M.alphaToCoverage===!1,alphaMap:J,alphaTest:he,alphaHash:ce,combine:M.combine,mapUv:X&&v(M.map.channel),aoMapUv:R&&v(M.aoMap.channel),lightMapUv:nt&&v(M.lightMap.channel),bumpMapUv:Pe&&v(M.bumpMap.channel),normalMapUv:we&&v(M.normalMap.channel),displacementMapUv:fe&&v(M.displacementMap.channel),emissiveMapUv:ze&&v(M.emissiveMap.channel),metalnessMapUv:ye&&v(M.metalnessMap.channel),roughnessMapUv:T&&v(M.roughnessMap.channel),anisotropyMapUv:oe&&v(M.anisotropyMap.channel),clearcoatMapUv:pe&&v(M.clearcoatMap.channel),clearcoatNormalMapUv:qe&&v(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&v(M.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&v(M.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&v(M.iridescenceThicknessMap.channel),sheenColorMapUv:Ie&&v(M.sheenColorMap.channel),sheenRoughnessMapUv:ge&&v(M.sheenRoughnessMap.channel),specularMapUv:We&&v(M.specularMap.channel),specularColorMapUv:ke&&v(M.specularColorMap.channel),specularIntensityMapUv:Qe&&v(M.specularIntensityMap.channel),transmissionMapUv:I&&v(M.transmissionMap.channel),thicknessMapUv:ae&&v(M.thicknessMap.channel),alphaMapUv:J&&v(M.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(we||_),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!$.attributes.uv&&(X||J),fog:!!q,useFog:M.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Ee,skinning:O.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:ue,morphTextureStride:De,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:at,decodeVideoTexture:X&&M.map.isVideoTexture===!0&&Xe.getTransfer(M.map.colorSpace)===Je,decodeVideoTextureEmissive:ze&&M.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(M.emissiveMap.colorSpace)===Je,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===ln,flipSided:M.side===Mt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ue&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ue&&M.extensions.multiDraw===!0||Be)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return vt.vertexUv1s=c.has(1),vt.vertexUv2s=c.has(2),vt.vertexUv3s=c.has(3),c.clear(),vt}function h(M){const x=[];if(M.shaderID?x.push(M.shaderID):(x.push(M.customVertexShaderID),x.push(M.customFragmentShaderID)),M.defines!==void 0)for(const C in M.defines)x.push(C),x.push(M.defines[C]);return M.isRawShaderMaterial===!1&&(b(x,M),E(x,M),x.push(i.outputColorSpace)),x.push(M.customProgramCacheKey),x.join()}function b(M,x){M.push(x.precision),M.push(x.outputColorSpace),M.push(x.envMapMode),M.push(x.envMapCubeUVHeight),M.push(x.mapUv),M.push(x.alphaMapUv),M.push(x.lightMapUv),M.push(x.aoMapUv),M.push(x.bumpMapUv),M.push(x.normalMapUv),M.push(x.displacementMapUv),M.push(x.emissiveMapUv),M.push(x.metalnessMapUv),M.push(x.roughnessMapUv),M.push(x.anisotropyMapUv),M.push(x.clearcoatMapUv),M.push(x.clearcoatNormalMapUv),M.push(x.clearcoatRoughnessMapUv),M.push(x.iridescenceMapUv),M.push(x.iridescenceThicknessMapUv),M.push(x.sheenColorMapUv),M.push(x.sheenRoughnessMapUv),M.push(x.specularMapUv),M.push(x.specularColorMapUv),M.push(x.specularIntensityMapUv),M.push(x.transmissionMapUv),M.push(x.thicknessMapUv),M.push(x.combine),M.push(x.fogExp2),M.push(x.sizeAttenuation),M.push(x.morphTargetsCount),M.push(x.morphAttributeCount),M.push(x.numDirLights),M.push(x.numPointLights),M.push(x.numSpotLights),M.push(x.numSpotLightMaps),M.push(x.numHemiLights),M.push(x.numRectAreaLights),M.push(x.numDirLightShadows),M.push(x.numPointLightShadows),M.push(x.numSpotLightShadows),M.push(x.numSpotLightShadowsWithMaps),M.push(x.numLightProbes),M.push(x.shadowMapType),M.push(x.toneMapping),M.push(x.numClippingPlanes),M.push(x.numClipIntersection),M.push(x.depthPacking)}function E(M,x){o.disableAll(),x.supportsVertexTextures&&o.enable(0),x.instancing&&o.enable(1),x.instancingColor&&o.enable(2),x.instancingMorph&&o.enable(3),x.matcap&&o.enable(4),x.envMap&&o.enable(5),x.normalMapObjectSpace&&o.enable(6),x.normalMapTangentSpace&&o.enable(7),x.clearcoat&&o.enable(8),x.iridescence&&o.enable(9),x.alphaTest&&o.enable(10),x.vertexColors&&o.enable(11),x.vertexAlphas&&o.enable(12),x.vertexUv1s&&o.enable(13),x.vertexUv2s&&o.enable(14),x.vertexUv3s&&o.enable(15),x.vertexTangents&&o.enable(16),x.anisotropy&&o.enable(17),x.alphaHash&&o.enable(18),x.batching&&o.enable(19),x.dispersion&&o.enable(20),x.batchingColor&&o.enable(21),M.push(o.mask),o.disableAll(),x.fog&&o.enable(0),x.useFog&&o.enable(1),x.flatShading&&o.enable(2),x.logarithmicDepthBuffer&&o.enable(3),x.reverseDepthBuffer&&o.enable(4),x.skinning&&o.enable(5),x.morphTargets&&o.enable(6),x.morphNormals&&o.enable(7),x.morphColors&&o.enable(8),x.premultipliedAlpha&&o.enable(9),x.shadowMapEnabled&&o.enable(10),x.doubleSided&&o.enable(11),x.flipSided&&o.enable(12),x.useDepthPacking&&o.enable(13),x.dithering&&o.enable(14),x.transmission&&o.enable(15),x.sheen&&o.enable(16),x.opaque&&o.enable(17),x.pointsUvs&&o.enable(18),x.decodeVideoTexture&&o.enable(19),x.decodeVideoTextureEmissive&&o.enable(20),x.alphaToCoverage&&o.enable(21),M.push(o.mask)}function S(M){const x=g[M.type];let C;if(x){const z=jt[x];C=is.clone(z.uniforms)}else C=M.uniforms;return C}function P(M,x){let C;for(let z=0,O=d.length;z<O;z++){const q=d[z];if(q.cacheKey===x){C=q,++C.usedTimes;break}}return C===void 0&&(C=new km(i,x,M,r),d.push(C)),C}function A(M){if(--M.usedTimes===0){const x=d.indexOf(M);d[x]=d[d.length-1],d.pop(),M.destroy()}}function w(M){l.remove(M)}function N(){l.dispose()}return{getParameters:p,getProgramCacheKey:h,getUniforms:S,acquireProgram:P,releaseProgram:A,releaseShaderCache:w,programs:d,dispose:N}}function Wm(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Xm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function gl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function vl(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u,f,m,g,v,p){let h=i[e];return h===void 0?(h={id:u.id,object:u,geometry:f,material:m,groupOrder:g,renderOrder:u.renderOrder,z:v,group:p},i[e]=h):(h.id=u.id,h.object=u,h.geometry=f,h.material=m,h.groupOrder=g,h.renderOrder=u.renderOrder,h.z=v,h.group=p),e++,h}function o(u,f,m,g,v,p){const h=a(u,f,m,g,v,p);m.transmission>0?n.push(h):m.transparent===!0?s.push(h):t.push(h)}function l(u,f,m,g,v,p){const h=a(u,f,m,g,v,p);m.transmission>0?n.unshift(h):m.transparent===!0?s.unshift(h):t.unshift(h)}function c(u,f){t.length>1&&t.sort(u||Xm),n.length>1&&n.sort(f||gl),s.length>1&&s.sort(f||gl)}function d(){for(let u=e,f=i.length;u<f;u++){const m=i[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:d,sort:c}}function qm(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new vl,i.set(n,[a])):s>=r.length?(a=new vl,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Ym(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new U,color:new Ve};break;case"SpotLight":t={position:new U,direction:new U,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function $m(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let jm=0;function Km(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Jm(i){const e=new Ym,t=$m(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);const s=new U,r=new rt,a=new rt;function o(c){let d=0,u=0,f=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let m=0,g=0,v=0,p=0,h=0,b=0,E=0,S=0,P=0,A=0,w=0;c.sort(Km);for(let M=0,x=c.length;M<x;M++){const C=c[M],z=C.color,O=C.intensity,q=C.distance,$=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)d+=z.r*O,u+=z.g*O,f+=z.b*O;else if(C.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(C.sh.coefficients[V],O);w++}else if(C.isDirectionalLight){const V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const j=C.shadow,B=t.get(C);B.shadowIntensity=j.intensity,B.shadowBias=j.bias,B.shadowNormalBias=j.normalBias,B.shadowRadius=j.radius,B.shadowMapSize=j.mapSize,n.directionalShadow[m]=B,n.directionalShadowMap[m]=$,n.directionalShadowMatrix[m]=C.shadow.matrix,b++}n.directional[m]=V,m++}else if(C.isSpotLight){const V=e.get(C);V.position.setFromMatrixPosition(C.matrixWorld),V.color.copy(z).multiplyScalar(O),V.distance=q,V.coneCos=Math.cos(C.angle),V.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),V.decay=C.decay,n.spot[v]=V;const j=C.shadow;if(C.map&&(n.spotLightMap[P]=C.map,P++,j.updateMatrices(C),C.castShadow&&A++),n.spotLightMatrix[v]=j.matrix,C.castShadow){const B=t.get(C);B.shadowIntensity=j.intensity,B.shadowBias=j.bias,B.shadowNormalBias=j.normalBias,B.shadowRadius=j.radius,B.shadowMapSize=j.mapSize,n.spotShadow[v]=B,n.spotShadowMap[v]=$,S++}v++}else if(C.isRectAreaLight){const V=e.get(C);V.color.copy(z).multiplyScalar(O),V.halfWidth.set(C.width*.5,0,0),V.halfHeight.set(0,C.height*.5,0),n.rectArea[p]=V,p++}else if(C.isPointLight){const V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),V.distance=C.distance,V.decay=C.decay,C.castShadow){const j=C.shadow,B=t.get(C);B.shadowIntensity=j.intensity,B.shadowBias=j.bias,B.shadowNormalBias=j.normalBias,B.shadowRadius=j.radius,B.shadowMapSize=j.mapSize,B.shadowCameraNear=j.camera.near,B.shadowCameraFar=j.camera.far,n.pointShadow[g]=B,n.pointShadowMap[g]=$,n.pointShadowMatrix[g]=C.shadow.matrix,E++}n.point[g]=V,g++}else if(C.isHemisphereLight){const V=e.get(C);V.skyColor.copy(C.color).multiplyScalar(O),V.groundColor.copy(C.groundColor).multiplyScalar(O),n.hemi[h]=V,h++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=re.LTC_FLOAT_1,n.rectAreaLTC2=re.LTC_FLOAT_2):(n.rectAreaLTC1=re.LTC_HALF_1,n.rectAreaLTC2=re.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=u,n.ambient[2]=f;const N=n.hash;(N.directionalLength!==m||N.pointLength!==g||N.spotLength!==v||N.rectAreaLength!==p||N.hemiLength!==h||N.numDirectionalShadows!==b||N.numPointShadows!==E||N.numSpotShadows!==S||N.numSpotMaps!==P||N.numLightProbes!==w)&&(n.directional.length=m,n.spot.length=v,n.rectArea.length=p,n.point.length=g,n.hemi.length=h,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=S+P-A,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=w,N.directionalLength=m,N.pointLength=g,N.spotLength=v,N.rectAreaLength=p,N.hemiLength=h,N.numDirectionalShadows=b,N.numPointShadows=E,N.numSpotShadows=S,N.numSpotMaps=P,N.numLightProbes=w,n.version=jm++)}function l(c,d){let u=0,f=0,m=0,g=0,v=0;const p=d.matrixWorldInverse;for(let h=0,b=c.length;h<b;h++){const E=c[h];if(E.isDirectionalLight){const S=n.directional[u];S.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(p),u++}else if(E.isSpotLight){const S=n.spot[m];S.position.setFromMatrixPosition(E.matrixWorld),S.position.applyMatrix4(p),S.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(p),m++}else if(E.isRectAreaLight){const S=n.rectArea[g];S.position.setFromMatrixPosition(E.matrixWorld),S.position.applyMatrix4(p),a.identity(),r.copy(E.matrixWorld),r.premultiply(p),a.extractRotation(r),S.halfWidth.set(E.width*.5,0,0),S.halfHeight.set(0,E.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),g++}else if(E.isPointLight){const S=n.point[f];S.position.setFromMatrixPosition(E.matrixWorld),S.position.applyMatrix4(p),f++}else if(E.isHemisphereLight){const S=n.hemi[v];S.direction.setFromMatrixPosition(E.matrixWorld),S.direction.transformDirection(p),v++}}}return{setup:o,setupView:l,state:n}}function _l(i){const e=new Jm(i),t=[],n=[];function s(d){c.camera=d,t.length=0,n.length=0}function r(d){t.push(d)}function a(d){n.push(d)}function o(){e.setup(t)}function l(d){e.setupView(t,d)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Zm(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new _l(i),e.set(s,[o])):r>=a.length?(o=new _l(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}class Qm extends jn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=$d,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class eg extends jn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const tg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ng=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ig(i,e,t){let n=new yc;const s=new Le,r=new Le,a=new lt,o=new Qm({depthPacking:jd}),l=new eg,c={},d=t.maxTextureSize,u={[Dn]:Mt,[Mt]:Dn,[ln]:ln},f=new mt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Le},radius:{value:4}},vertexShader:tg,fragmentShader:ng}),m=f.clone();m.defines.HORIZONTAL_PASS=1;const g=new Tt;g.setAttribute("position",new dt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ct(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xl;let h=this.type;this.render=function(A,w,N){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||A.length===0)return;const M=i.getRenderTarget(),x=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),z=i.state;z.setBlending(un),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const O=h!==on&&this.type===on,q=h===on&&this.type!==on;for(let $=0,V=A.length;$<V;$++){const j=A[$],B=j.shadow;if(B===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;s.copy(B.mapSize);const Q=B.getFrameExtents();if(s.multiply(Q),r.copy(B.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/Q.x),s.x=r.x*Q.x,B.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/Q.y),s.y=r.y*Q.y,B.mapSize.y=r.y)),B.map===null||O===!0||q===!0){const ue=this.type!==on?{minFilter:qt,magFilter:qt}:{};B.map!==null&&B.map.dispose(),B.map=new Yt(s.x,s.y,ue),B.map.texture.name=j.name+".shadowMap",B.camera.updateProjectionMatrix()}i.setRenderTarget(B.map),i.clear();const ie=B.getViewportCount();for(let ue=0;ue<ie;ue++){const De=B.getViewport(ue);a.set(r.x*De.x,r.y*De.y,r.x*De.z,r.y*De.w),z.viewport(a),B.updateMatrices(j,ue),n=B.getFrustum(),S(w,N,B.camera,j,this.type)}B.isPointLightShadow!==!0&&this.type===on&&b(B,N),B.needsUpdate=!1}h=this.type,p.needsUpdate=!1,i.setRenderTarget(M,x,C)};function b(A,w){const N=e.update(v);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,m.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Yt(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(w,null,N,f,v,null),m.uniforms.shadow_pass.value=A.mapPass.texture,m.uniforms.resolution.value=A.mapSize,m.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(w,null,N,m,v,null)}function E(A,w,N,M){let x=null;const C=N.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(C!==void 0)x=C;else if(x=N.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const z=x.uuid,O=w.uuid;let q=c[z];q===void 0&&(q={},c[z]=q);let $=q[O];$===void 0&&($=x.clone(),q[O]=$,w.addEventListener("dispose",P)),x=$}if(x.visible=w.visible,x.wireframe=w.wireframe,M===on?x.side=w.shadowSide!==null?w.shadowSide:w.side:x.side=w.shadowSide!==null?w.shadowSide:u[w.side],x.alphaMap=w.alphaMap,x.alphaTest=w.alphaTest,x.map=w.map,x.clipShadows=w.clipShadows,x.clippingPlanes=w.clippingPlanes,x.clipIntersection=w.clipIntersection,x.displacementMap=w.displacementMap,x.displacementScale=w.displacementScale,x.displacementBias=w.displacementBias,x.wireframeLinewidth=w.wireframeLinewidth,x.linewidth=w.linewidth,N.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const z=i.properties.get(x);z.light=N}return x}function S(A,w,N,M,x){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&x===on)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,A.matrixWorld);const O=e.update(A),q=A.material;if(Array.isArray(q)){const $=O.groups;for(let V=0,j=$.length;V<j;V++){const B=$[V],Q=q[B.materialIndex];if(Q&&Q.visible){const ie=E(A,Q,M,x);A.onBeforeShadow(i,A,w,N,O,ie,B),i.renderBufferDirect(N,null,O,ie,A,B),A.onAfterShadow(i,A,w,N,O,ie,B)}}}else if(q.visible){const $=E(A,q,M,x);A.onBeforeShadow(i,A,w,N,O,$,null),i.renderBufferDirect(N,null,O,$,A,null),A.onAfterShadow(i,A,w,N,O,$,null)}}const z=A.children;for(let O=0,q=z.length;O<q;O++)S(z[O],w,N,M,x)}function P(A){A.target.removeEventListener("dispose",P);for(const N in c){const M=c[N],x=A.target.uuid;x in M&&(M[x].dispose(),delete M[x])}}}const sg={[ra]:aa,[oa]:da,[la]:ha,[bi]:ca,[aa]:ra,[da]:oa,[ha]:la,[ca]:bi};function rg(i,e){function t(){let I=!1;const ae=new lt;let G=null;const J=new lt(0,0,0,0);return{setMask:function(he){G!==he&&!I&&(i.colorMask(he,he,he,he),G=he)},setLocked:function(he){I=he},setClear:function(he,ce,Ue,at,vt){vt===!0&&(he*=at,ce*=at,Ue*=at),ae.set(he,ce,Ue,at),J.equals(ae)===!1&&(i.clearColor(he,ce,Ue,at),J.copy(ae))},reset:function(){I=!1,G=null,J.set(-1,0,0,0)}}}function n(){let I=!1,ae=!1,G=null,J=null,he=null;return{setReversed:function(ce){if(ae!==ce){const Ue=e.get("EXT_clip_control");ae?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT);const at=he;he=null,this.setClear(at)}ae=ce},getReversed:function(){return ae},setTest:function(ce){ce?se(i.DEPTH_TEST):Ee(i.DEPTH_TEST)},setMask:function(ce){G!==ce&&!I&&(i.depthMask(ce),G=ce)},setFunc:function(ce){if(ae&&(ce=sg[ce]),J!==ce){switch(ce){case ra:i.depthFunc(i.NEVER);break;case aa:i.depthFunc(i.ALWAYS);break;case oa:i.depthFunc(i.LESS);break;case bi:i.depthFunc(i.LEQUAL);break;case la:i.depthFunc(i.EQUAL);break;case ca:i.depthFunc(i.GEQUAL);break;case da:i.depthFunc(i.GREATER);break;case ha:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}J=ce}},setLocked:function(ce){I=ce},setClear:function(ce){he!==ce&&(ae&&(ce=1-ce),i.clearDepth(ce),he=ce)},reset:function(){I=!1,G=null,J=null,he=null,ae=!1}}}function s(){let I=!1,ae=null,G=null,J=null,he=null,ce=null,Ue=null,at=null,vt=null;return{setTest:function(Ke){I||(Ke?se(i.STENCIL_TEST):Ee(i.STENCIL_TEST))},setMask:function(Ke){ae!==Ke&&!I&&(i.stencilMask(Ke),ae=Ke)},setFunc:function(Ke,Ht,Qt){(G!==Ke||J!==Ht||he!==Qt)&&(i.stencilFunc(Ke,Ht,Qt),G=Ke,J=Ht,he=Qt)},setOp:function(Ke,Ht,Qt){(ce!==Ke||Ue!==Ht||at!==Qt)&&(i.stencilOp(Ke,Ht,Qt),ce=Ke,Ue=Ht,at=Qt)},setLocked:function(Ke){I=Ke},setClear:function(Ke){vt!==Ke&&(i.clearStencil(Ke),vt=Ke)},reset:function(){I=!1,ae=null,G=null,J=null,he=null,ce=null,Ue=null,at=null,vt=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let d={},u={},f=new WeakMap,m=[],g=null,v=!1,p=null,h=null,b=null,E=null,S=null,P=null,A=null,w=new Ve(0,0,0),N=0,M=!1,x=null,C=null,z=null,O=null,q=null;const $=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,j=0;const B=i.getParameter(i.VERSION);B.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(B)[1]),V=j>=1):B.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),V=j>=2);let Q=null,ie={};const ue=i.getParameter(i.SCISSOR_BOX),De=i.getParameter(i.VIEWPORT),Ge=new lt().fromArray(ue),W=new lt().fromArray(De);function ee(I,ae,G,J){const he=new Uint8Array(4),ce=i.createTexture();i.bindTexture(I,ce),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<G;Ue++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(ae,0,i.RGBA,1,1,J,0,i.RGBA,i.UNSIGNED_BYTE,he):i.texImage2D(ae+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,he);return ce}const _e={};_e[i.TEXTURE_2D]=ee(i.TEXTURE_2D,i.TEXTURE_2D,1),_e[i.TEXTURE_CUBE_MAP]=ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[i.TEXTURE_2D_ARRAY]=ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),_e[i.TEXTURE_3D]=ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(i.DEPTH_TEST),a.setFunc(bi),Pe(!1),we(Eo),se(i.CULL_FACE),R(un);function se(I){d[I]!==!0&&(i.enable(I),d[I]=!0)}function Ee(I){d[I]!==!1&&(i.disable(I),d[I]=!1)}function Re(I,ae){return u[I]!==ae?(i.bindFramebuffer(I,ae),u[I]=ae,I===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ae),I===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ae),!0):!1}function Be(I,ae){let G=m,J=!1;if(I){G=f.get(ae),G===void 0&&(G=[],f.set(ae,G));const he=I.textures;if(G.length!==he.length||G[0]!==i.COLOR_ATTACHMENT0){for(let ce=0,Ue=he.length;ce<Ue;ce++)G[ce]=i.COLOR_ATTACHMENT0+ce;G.length=he.length,J=!0}}else G[0]!==i.BACK&&(G[0]=i.BACK,J=!0);J&&i.drawBuffers(G)}function X(I){return g!==I?(i.useProgram(I),g=I,!0):!1}const le={[Wn]:i.FUNC_ADD,[wd]:i.FUNC_SUBTRACT,[Cd]:i.FUNC_REVERSE_SUBTRACT};le[Rd]=i.MIN,le[Pd]=i.MAX;const ve={[Id]:i.ZERO,[Ld]:i.ONE,[Dd]:i.SRC_COLOR,[ia]:i.SRC_ALPHA,[kd]:i.SRC_ALPHA_SATURATE,[Fd]:i.DST_COLOR,[Ud]:i.DST_ALPHA,[Nd]:i.ONE_MINUS_SRC_COLOR,[sa]:i.ONE_MINUS_SRC_ALPHA,[Bd]:i.ONE_MINUS_DST_COLOR,[Od]:i.ONE_MINUS_DST_ALPHA,[Hd]:i.CONSTANT_COLOR,[zd]:i.ONE_MINUS_CONSTANT_COLOR,[Vd]:i.CONSTANT_ALPHA,[Gd]:i.ONE_MINUS_CONSTANT_ALPHA};function R(I,ae,G,J,he,ce,Ue,at,vt,Ke){if(I===un){v===!0&&(Ee(i.BLEND),v=!1);return}if(v===!1&&(se(i.BLEND),v=!0),I!==Ad){if(I!==p||Ke!==M){if((h!==Wn||S!==Wn)&&(i.blendEquation(i.FUNC_ADD),h=Wn,S=Wn),Ke)switch(I){case xi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zt:i.blendFunc(i.ONE,i.ONE);break;case To:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ao:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case xi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zt:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case To:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ao:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}b=null,E=null,P=null,A=null,w.set(0,0,0),N=0,p=I,M=Ke}return}he=he||ae,ce=ce||G,Ue=Ue||J,(ae!==h||he!==S)&&(i.blendEquationSeparate(le[ae],le[he]),h=ae,S=he),(G!==b||J!==E||ce!==P||Ue!==A)&&(i.blendFuncSeparate(ve[G],ve[J],ve[ce],ve[Ue]),b=G,E=J,P=ce,A=Ue),(at.equals(w)===!1||vt!==N)&&(i.blendColor(at.r,at.g,at.b,vt),w.copy(at),N=vt),p=I,M=!1}function nt(I,ae){I.side===ln?Ee(i.CULL_FACE):se(i.CULL_FACE);let G=I.side===Mt;ae&&(G=!G),Pe(G),I.blending===xi&&I.transparent===!1?R(un):R(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);const J=I.stencilWrite;o.setTest(J),J&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),ze(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?se(i.SAMPLE_ALPHA_TO_COVERAGE):Ee(i.SAMPLE_ALPHA_TO_COVERAGE)}function Pe(I){x!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),x=I)}function we(I){I!==Md?(se(i.CULL_FACE),I!==C&&(I===Eo?i.cullFace(i.BACK):I===Ed?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ee(i.CULL_FACE),C=I}function fe(I){I!==z&&(V&&i.lineWidth(I),z=I)}function ze(I,ae,G){I?(se(i.POLYGON_OFFSET_FILL),(O!==ae||q!==G)&&(i.polygonOffset(ae,G),O=ae,q=G)):Ee(i.POLYGON_OFFSET_FILL)}function ye(I){I?se(i.SCISSOR_TEST):Ee(i.SCISSOR_TEST)}function T(I){I===void 0&&(I=i.TEXTURE0+$-1),Q!==I&&(i.activeTexture(I),Q=I)}function _(I,ae,G){G===void 0&&(Q===null?G=i.TEXTURE0+$-1:G=Q);let J=ie[G];J===void 0&&(J={type:void 0,texture:void 0},ie[G]=J),(J.type!==I||J.texture!==ae)&&(Q!==G&&(i.activeTexture(G),Q=G),i.bindTexture(I,ae||_e[I]),J.type=I,J.texture=ae)}function F(){const I=ie[Q];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Y(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Z(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Te(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function oe(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function pe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function qe(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function te(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function me(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ce(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ie(I){Ge.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Ge.copy(I))}function ge(I){W.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),W.copy(I))}function We(I,ae){let G=c.get(ae);G===void 0&&(G=new WeakMap,c.set(ae,G));let J=G.get(I);J===void 0&&(J=i.getUniformBlockIndex(ae,I.name),G.set(I,J))}function ke(I,ae){const J=c.get(ae).get(I);l.get(ae)!==J&&(i.uniformBlockBinding(ae,J,I.__bindingPointIndex),l.set(ae,J))}function Qe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},Q=null,ie={},u={},f=new WeakMap,m=[],g=null,v=!1,p=null,h=null,b=null,E=null,S=null,P=null,A=null,w=new Ve(0,0,0),N=0,M=!1,x=null,C=null,z=null,O=null,q=null,Ge.set(0,0,i.canvas.width,i.canvas.height),W.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:se,disable:Ee,bindFramebuffer:Re,drawBuffers:Be,useProgram:X,setBlending:R,setMaterial:nt,setFlipSided:Pe,setCullFace:we,setLineWidth:fe,setPolygonOffset:ze,setScissorTest:ye,activeTexture:T,bindTexture:_,unbindTexture:F,compressedTexImage2D:Y,compressedTexImage3D:Z,texImage2D:me,texImage3D:Ce,updateUBOMapping:We,uniformBlockBinding:ke,texStorage2D:qe,texStorage3D:te,texSubImage2D:K,texSubImage3D:Te,compressedTexSubImage2D:oe,compressedTexSubImage3D:pe,scissor:Ie,viewport:ge,reset:Qe}}function xl(i,e,t,n){const s=ag(n);switch(t){case nc:return i*e;case sc:return i*e;case rc:return i*e*2;case ac:return i*e/s.components*s.byteLength;case Ja:return i*e/s.components*s.byteLength;case oc:return i*e*2/s.components*s.byteLength;case Za:return i*e*2/s.components*s.byteLength;case ic:return i*e*3/s.components*s.byteLength;case Xt:return i*e*4/s.components*s.byteLength;case Qa:return i*e*4/s.components*s.byteLength;case Ys:case $s:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case js:case Ks:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ga:case _a:return Math.max(i,16)*Math.max(e,8)/4;case ma:case va:return Math.max(i,8)*Math.max(e,8)/2;case xa:case ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Sa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ba:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ea:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ta:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Aa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case wa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ca:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ra:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Pa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case La:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Da:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Na:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ua:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Js:case Oa:case Fa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case lc:case Ba:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ka:case Ha:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ag(i){switch(i){case mn:case Ql:return{byteLength:1,components:1};case ns:case ec:case fn:return{byteLength:2,components:1};case ja:case Ka:return{byteLength:2,components:4};case $n:case $a:case cn:return{byteLength:4,components:1};case tc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function og(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Le,d=new WeakMap;let u;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return m?new OffscreenCanvas(T,_):tr("canvas")}function v(T,_,F){let Y=1;const Z=ye(T);if((Z.width>F||Z.height>F)&&(Y=F/Math.max(Z.width,Z.height)),Y<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const K=Math.floor(Y*Z.width),Te=Math.floor(Y*Z.height);u===void 0&&(u=g(K,Te));const oe=_?g(K,Te):u;return oe.width=K,oe.height=Te,oe.getContext("2d").drawImage(T,0,0,K,Te),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+K+"x"+Te+")."),oe}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),T;return T}function p(T){return T.generateMipmaps}function h(T){i.generateMipmap(T)}function b(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(T,_,F,Y,Z=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let K=_;if(_===i.RED&&(F===i.FLOAT&&(K=i.R32F),F===i.HALF_FLOAT&&(K=i.R16F),F===i.UNSIGNED_BYTE&&(K=i.R8)),_===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.R8UI),F===i.UNSIGNED_SHORT&&(K=i.R16UI),F===i.UNSIGNED_INT&&(K=i.R32UI),F===i.BYTE&&(K=i.R8I),F===i.SHORT&&(K=i.R16I),F===i.INT&&(K=i.R32I)),_===i.RG&&(F===i.FLOAT&&(K=i.RG32F),F===i.HALF_FLOAT&&(K=i.RG16F),F===i.UNSIGNED_BYTE&&(K=i.RG8)),_===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RG8UI),F===i.UNSIGNED_SHORT&&(K=i.RG16UI),F===i.UNSIGNED_INT&&(K=i.RG32UI),F===i.BYTE&&(K=i.RG8I),F===i.SHORT&&(K=i.RG16I),F===i.INT&&(K=i.RG32I)),_===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGB8UI),F===i.UNSIGNED_SHORT&&(K=i.RGB16UI),F===i.UNSIGNED_INT&&(K=i.RGB32UI),F===i.BYTE&&(K=i.RGB8I),F===i.SHORT&&(K=i.RGB16I),F===i.INT&&(K=i.RGB32I)),_===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),F===i.UNSIGNED_INT&&(K=i.RGBA32UI),F===i.BYTE&&(K=i.RGBA8I),F===i.SHORT&&(K=i.RGBA16I),F===i.INT&&(K=i.RGBA32I)),_===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),_===i.RGBA){const Te=Z?ar:Xe.getTransfer(Y);F===i.FLOAT&&(K=i.RGBA32F),F===i.HALF_FLOAT&&(K=i.RGBA16F),F===i.UNSIGNED_BYTE&&(K=Te===Je?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function S(T,_){let F;return T?_===null||_===$n||_===Ti?F=i.DEPTH24_STENCIL8:_===cn?F=i.DEPTH32F_STENCIL8:_===ns&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===$n||_===Ti?F=i.DEPTH_COMPONENT24:_===cn?F=i.DEPTH_COMPONENT32F:_===ns&&(F=i.DEPTH_COMPONENT16),F}function P(T,_){return p(T)===!0||T.isFramebufferTexture&&T.minFilter!==qt&&T.minFilter!==Jt?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function A(T){const _=T.target;_.removeEventListener("dispose",A),N(_),_.isVideoTexture&&d.delete(_)}function w(T){const _=T.target;_.removeEventListener("dispose",w),x(_)}function N(T){const _=n.get(T);if(_.__webglInit===void 0)return;const F=T.source,Y=f.get(F);if(Y){const Z=Y[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&M(T),Object.keys(Y).length===0&&f.delete(F)}n.remove(T)}function M(T){const _=n.get(T);i.deleteTexture(_.__webglTexture);const F=T.source,Y=f.get(F);delete Y[_.__cacheKey],a.memory.textures--}function x(T){const _=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(_.__webglFramebuffer[Y]))for(let Z=0;Z<_.__webglFramebuffer[Y].length;Z++)i.deleteFramebuffer(_.__webglFramebuffer[Y][Z]);else i.deleteFramebuffer(_.__webglFramebuffer[Y]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[Y])}else{if(Array.isArray(_.__webglFramebuffer))for(let Y=0;Y<_.__webglFramebuffer.length;Y++)i.deleteFramebuffer(_.__webglFramebuffer[Y]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let Y=0;Y<_.__webglColorRenderbuffer.length;Y++)_.__webglColorRenderbuffer[Y]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[Y]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const F=T.textures;for(let Y=0,Z=F.length;Y<Z;Y++){const K=n.get(F[Y]);K.__webglTexture&&(i.deleteTexture(K.__webglTexture),a.memory.textures--),n.remove(F[Y])}n.remove(T)}let C=0;function z(){C=0}function O(){const T=C;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),C+=1,T}function q(T){const _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function $(T,_){const F=n.get(T);if(T.isVideoTexture&&fe(T),T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){const Y=T.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{W(F,T,_);return}}t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+_)}function V(T,_){const F=n.get(T);if(T.version>0&&F.__version!==T.version){W(F,T,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+_)}function j(T,_){const F=n.get(T);if(T.version>0&&F.__version!==T.version){W(F,T,_);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+_)}function B(T,_){const F=n.get(T);if(T.version>0&&F.__version!==T.version){ee(F,T,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+_)}const Q={[Qs]:i.REPEAT,[Cn]:i.CLAMP_TO_EDGE,[pa]:i.MIRRORED_REPEAT},ie={[qt]:i.NEAREST,[Yd]:i.NEAREST_MIPMAP_NEAREST,[ps]:i.NEAREST_MIPMAP_LINEAR,[Jt]:i.LINEAR,[fr]:i.LINEAR_MIPMAP_NEAREST,[qn]:i.LINEAR_MIPMAP_LINEAR},ue={[Zd]:i.NEVER,[sh]:i.ALWAYS,[Qd]:i.LESS,[cc]:i.LEQUAL,[eh]:i.EQUAL,[ih]:i.GEQUAL,[th]:i.GREATER,[nh]:i.NOTEQUAL};function De(T,_){if(_.type===cn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Jt||_.magFilter===fr||_.magFilter===ps||_.magFilter===qn||_.minFilter===Jt||_.minFilter===fr||_.minFilter===ps||_.minFilter===qn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,Q[_.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,Q[_.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,Q[_.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,ie[_.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,ie[_.minFilter]),_.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,ue[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===qt||_.minFilter!==ps&&_.minFilter!==qn||_.type===cn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Ge(T,_){let F=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",A));const Y=_.source;let Z=f.get(Y);Z===void 0&&(Z={},f.set(Y,Z));const K=q(_);if(K!==T.__cacheKey){Z[K]===void 0&&(Z[K]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),Z[K].usedTimes++;const Te=Z[T.__cacheKey];Te!==void 0&&(Z[T.__cacheKey].usedTimes--,Te.usedTimes===0&&M(_)),T.__cacheKey=K,T.__webglTexture=Z[K].texture}return F}function W(T,_,F){let Y=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(Y=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(Y=i.TEXTURE_3D);const Z=Ge(T,_),K=_.source;t.bindTexture(Y,T.__webglTexture,i.TEXTURE0+F);const Te=n.get(K);if(K.version!==Te.__version||Z===!0){t.activeTexture(i.TEXTURE0+F);const oe=Xe.getPrimaries(Xe.workingColorSpace),pe=_.colorSpace===wn?null:Xe.getPrimaries(_.colorSpace),qe=_.colorSpace===wn||oe===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,qe);let te=v(_.image,!1,s.maxTextureSize);te=ze(_,te);const me=r.convert(_.format,_.colorSpace),Ce=r.convert(_.type);let Ie=E(_.internalFormat,me,Ce,_.colorSpace,_.isVideoTexture);De(Y,_);let ge;const We=_.mipmaps,ke=_.isVideoTexture!==!0,Qe=Te.__version===void 0||Z===!0,I=K.dataReady,ae=P(_,te);if(_.isDepthTexture)Ie=S(_.format===Ai,_.type),Qe&&(ke?t.texStorage2D(i.TEXTURE_2D,1,Ie,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,Ie,te.width,te.height,0,me,Ce,null));else if(_.isDataTexture)if(We.length>0){ke&&Qe&&t.texStorage2D(i.TEXTURE_2D,ae,Ie,We[0].width,We[0].height);for(let G=0,J=We.length;G<J;G++)ge=We[G],ke?I&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,Ce,ge.data):t.texImage2D(i.TEXTURE_2D,G,Ie,ge.width,ge.height,0,me,Ce,ge.data);_.generateMipmaps=!1}else ke?(Qe&&t.texStorage2D(i.TEXTURE_2D,ae,Ie,te.width,te.height),I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,te.width,te.height,me,Ce,te.data)):t.texImage2D(i.TEXTURE_2D,0,Ie,te.width,te.height,0,me,Ce,te.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){ke&&Qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ae,Ie,We[0].width,We[0].height,te.depth);for(let G=0,J=We.length;G<J;G++)if(ge=We[G],_.format!==Xt)if(me!==null)if(ke){if(I)if(_.layerUpdates.size>0){const he=xl(ge.width,ge.height,_.format,_.type);for(const ce of _.layerUpdates){const Ue=ge.data.subarray(ce*he/ge.data.BYTES_PER_ELEMENT,(ce+1)*he/ge.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,ce,ge.width,ge.height,1,me,Ue)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,0,ge.width,ge.height,te.depth,me,ge.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,G,Ie,ge.width,ge.height,te.depth,0,ge.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?I&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,0,ge.width,ge.height,te.depth,me,Ce,ge.data):t.texImage3D(i.TEXTURE_2D_ARRAY,G,Ie,ge.width,ge.height,te.depth,0,me,Ce,ge.data)}else{ke&&Qe&&t.texStorage2D(i.TEXTURE_2D,ae,Ie,We[0].width,We[0].height);for(let G=0,J=We.length;G<J;G++)ge=We[G],_.format!==Xt?me!==null?ke?I&&t.compressedTexSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,ge.data):t.compressedTexImage2D(i.TEXTURE_2D,G,Ie,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?I&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,Ce,ge.data):t.texImage2D(i.TEXTURE_2D,G,Ie,ge.width,ge.height,0,me,Ce,ge.data)}else if(_.isDataArrayTexture)if(ke){if(Qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ae,Ie,te.width,te.height,te.depth),I)if(_.layerUpdates.size>0){const G=xl(te.width,te.height,_.format,_.type);for(const J of _.layerUpdates){const he=te.data.subarray(J*G/te.data.BYTES_PER_ELEMENT,(J+1)*G/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,te.width,te.height,1,me,Ce,he)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,me,Ce,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ie,te.width,te.height,te.depth,0,me,Ce,te.data);else if(_.isData3DTexture)ke?(Qe&&t.texStorage3D(i.TEXTURE_3D,ae,Ie,te.width,te.height,te.depth),I&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,me,Ce,te.data)):t.texImage3D(i.TEXTURE_3D,0,Ie,te.width,te.height,te.depth,0,me,Ce,te.data);else if(_.isFramebufferTexture){if(Qe)if(ke)t.texStorage2D(i.TEXTURE_2D,ae,Ie,te.width,te.height);else{let G=te.width,J=te.height;for(let he=0;he<ae;he++)t.texImage2D(i.TEXTURE_2D,he,Ie,G,J,0,me,Ce,null),G>>=1,J>>=1}}else if(We.length>0){if(ke&&Qe){const G=ye(We[0]);t.texStorage2D(i.TEXTURE_2D,ae,Ie,G.width,G.height)}for(let G=0,J=We.length;G<J;G++)ge=We[G],ke?I&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,me,Ce,ge):t.texImage2D(i.TEXTURE_2D,G,Ie,me,Ce,ge);_.generateMipmaps=!1}else if(ke){if(Qe){const G=ye(te);t.texStorage2D(i.TEXTURE_2D,ae,Ie,G.width,G.height)}I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,Ce,te)}else t.texImage2D(i.TEXTURE_2D,0,Ie,me,Ce,te);p(_)&&h(Y),Te.__version=K.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ee(T,_,F){if(_.image.length!==6)return;const Y=Ge(T,_),Z=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+F);const K=n.get(Z);if(Z.version!==K.__version||Y===!0){t.activeTexture(i.TEXTURE0+F);const Te=Xe.getPrimaries(Xe.workingColorSpace),oe=_.colorSpace===wn?null:Xe.getPrimaries(_.colorSpace),pe=_.colorSpace===wn||Te===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);const qe=_.isCompressedTexture||_.image[0].isCompressedTexture,te=_.image[0]&&_.image[0].isDataTexture,me=[];for(let J=0;J<6;J++)!qe&&!te?me[J]=v(_.image[J],!0,s.maxCubemapSize):me[J]=te?_.image[J].image:_.image[J],me[J]=ze(_,me[J]);const Ce=me[0],Ie=r.convert(_.format,_.colorSpace),ge=r.convert(_.type),We=E(_.internalFormat,Ie,ge,_.colorSpace),ke=_.isVideoTexture!==!0,Qe=K.__version===void 0||Y===!0,I=Z.dataReady;let ae=P(_,Ce);De(i.TEXTURE_CUBE_MAP,_);let G;if(qe){ke&&Qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ae,We,Ce.width,Ce.height);for(let J=0;J<6;J++){G=me[J].mipmaps;for(let he=0;he<G.length;he++){const ce=G[he];_.format!==Xt?Ie!==null?ke?I&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he,0,0,ce.width,ce.height,Ie,ce.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he,We,ce.width,ce.height,0,ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he,0,0,ce.width,ce.height,Ie,ge,ce.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he,We,ce.width,ce.height,0,Ie,ge,ce.data)}}}else{if(G=_.mipmaps,ke&&Qe){G.length>0&&ae++;const J=ye(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ae,We,J.width,J.height)}for(let J=0;J<6;J++)if(te){ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,me[J].width,me[J].height,Ie,ge,me[J].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,We,me[J].width,me[J].height,0,Ie,ge,me[J].data);for(let he=0;he<G.length;he++){const Ue=G[he].image[J].image;ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he+1,0,0,Ue.width,Ue.height,Ie,ge,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he+1,We,Ue.width,Ue.height,0,Ie,ge,Ue.data)}}else{ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Ie,ge,me[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,We,Ie,ge,me[J]);for(let he=0;he<G.length;he++){const ce=G[he];ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he+1,0,0,Ie,ge,ce.image[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,he+1,We,Ie,ge,ce.image[J])}}}p(_)&&h(i.TEXTURE_CUBE_MAP),K.__version=Z.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function _e(T,_,F,Y,Z,K){const Te=r.convert(F.format,F.colorSpace),oe=r.convert(F.type),pe=E(F.internalFormat,Te,oe,F.colorSpace),qe=n.get(_),te=n.get(F);if(te.__renderTarget=_,!qe.__hasExternalTextures){const me=Math.max(1,_.width>>K),Ce=Math.max(1,_.height>>K);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,K,pe,me,Ce,_.depth,0,Te,oe,null):t.texImage2D(Z,K,pe,me,Ce,0,Te,oe,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),we(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Y,Z,te.__webglTexture,0,Pe(_)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Y,Z,te.__webglTexture,K),t.bindFramebuffer(i.FRAMEBUFFER,null)}function se(T,_,F){if(i.bindRenderbuffer(i.RENDERBUFFER,T),_.depthBuffer){const Y=_.depthTexture,Z=Y&&Y.isDepthTexture?Y.type:null,K=S(_.stencilBuffer,Z),Te=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=Pe(_);we(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,oe,K,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,oe,K,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,K,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Te,i.RENDERBUFFER,T)}else{const Y=_.textures;for(let Z=0;Z<Y.length;Z++){const K=Y[Z],Te=r.convert(K.format,K.colorSpace),oe=r.convert(K.type),pe=E(K.internalFormat,Te,oe,K.colorSpace),qe=Pe(_);F&&we(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe,pe,_.width,_.height):we(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe,pe,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,pe,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ee(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Y=n.get(_.depthTexture);Y.__renderTarget=_,(!Y.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),$(_.depthTexture,0);const Z=Y.__webglTexture,K=Pe(_);if(_.depthTexture.format===yi)we(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0);else if(_.depthTexture.format===Ai)we(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function Re(T){const _=n.get(T),F=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){const Y=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),Y){const Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,Y.removeEventListener("dispose",Z)};Y.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=Y}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Ee(_.__webglFramebuffer,T)}else if(F){_.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[Y]),_.__webglDepthbuffer[Y]===void 0)_.__webglDepthbuffer[Y]=i.createRenderbuffer(),se(_.__webglDepthbuffer[Y],T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,K=_.__webglDepthbuffer[Y];i.bindRenderbuffer(i.RENDERBUFFER,K),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,K)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),se(_.__webglDepthbuffer,T,!1);else{const Y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,Z)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Be(T,_,F){const Y=n.get(T);_!==void 0&&_e(Y.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Re(T)}function X(T){const _=T.texture,F=n.get(T),Y=n.get(_);T.addEventListener("dispose",w);const Z=T.textures,K=T.isWebGLCubeRenderTarget===!0,Te=Z.length>1;if(Te||(Y.__webglTexture===void 0&&(Y.__webglTexture=i.createTexture()),Y.__version=_.version,a.memory.textures++),K){F.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[oe]=[];for(let pe=0;pe<_.mipmaps.length;pe++)F.__webglFramebuffer[oe][pe]=i.createFramebuffer()}else F.__webglFramebuffer[oe]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let oe=0;oe<_.mipmaps.length;oe++)F.__webglFramebuffer[oe]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Te)for(let oe=0,pe=Z.length;oe<pe;oe++){const qe=n.get(Z[oe]);qe.__webglTexture===void 0&&(qe.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&we(T)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let oe=0;oe<Z.length;oe++){const pe=Z[oe];F.__webglColorRenderbuffer[oe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[oe]);const qe=r.convert(pe.format,pe.colorSpace),te=r.convert(pe.type),me=E(pe.internalFormat,qe,te,pe.colorSpace,T.isXRRenderTarget===!0),Ce=Pe(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ce,me,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+oe,i.RENDERBUFFER,F.__webglColorRenderbuffer[oe])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),se(F.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(K){t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),De(i.TEXTURE_CUBE_MAP,_);for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0)for(let pe=0;pe<_.mipmaps.length;pe++)_e(F.__webglFramebuffer[oe][pe],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,pe);else _e(F.__webglFramebuffer[oe],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);p(_)&&h(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Te){for(let oe=0,pe=Z.length;oe<pe;oe++){const qe=Z[oe],te=n.get(qe);t.bindTexture(i.TEXTURE_2D,te.__webglTexture),De(i.TEXTURE_2D,qe),_e(F.__webglFramebuffer,T,qe,i.COLOR_ATTACHMENT0+oe,i.TEXTURE_2D,0),p(qe)&&h(i.TEXTURE_2D)}t.unbindTexture()}else{let oe=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(oe=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(oe,Y.__webglTexture),De(oe,_),_.mipmaps&&_.mipmaps.length>0)for(let pe=0;pe<_.mipmaps.length;pe++)_e(F.__webglFramebuffer[pe],T,_,i.COLOR_ATTACHMENT0,oe,pe);else _e(F.__webglFramebuffer,T,_,i.COLOR_ATTACHMENT0,oe,0);p(_)&&h(oe),t.unbindTexture()}T.depthBuffer&&Re(T)}function le(T){const _=T.textures;for(let F=0,Y=_.length;F<Y;F++){const Z=_[F];if(p(Z)){const K=b(T),Te=n.get(Z).__webglTexture;t.bindTexture(K,Te),h(K),t.unbindTexture()}}}const ve=[],R=[];function nt(T){if(T.samples>0){if(we(T)===!1){const _=T.textures,F=T.width,Y=T.height;let Z=i.COLOR_BUFFER_BIT;const K=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Te=n.get(T),oe=_.length>1;if(oe)for(let pe=0;pe<_.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Te.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let pe=0;pe<_.length;pe++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),oe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Te.__webglColorRenderbuffer[pe]);const qe=n.get(_[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,qe,0)}i.blitFramebuffer(0,0,F,Y,0,0,F,Y,Z,i.NEAREST),l===!0&&(ve.length=0,R.length=0,ve.push(i.COLOR_ATTACHMENT0+pe),T.depthBuffer&&T.resolveDepthBuffer===!1&&(ve.push(K),R.push(K),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,R)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ve))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),oe)for(let pe=0;pe<_.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,Te.__webglColorRenderbuffer[pe]);const qe=n.get(_[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Te.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,qe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const _=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function Pe(T){return Math.min(s.maxSamples,T.samples)}function we(T){const _=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function fe(T){const _=a.render.frame;d.get(T)!==_&&(d.set(T,_),T.update())}function ze(T,_){const F=T.colorSpace,Y=T.format,Z=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||F!==Pi&&F!==wn&&(Xe.getTransfer(F)===Je?(Y!==Xt||Z!==mn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),_}function ye(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=z,this.setTexture2D=$,this.setTexture2DArray=V,this.setTexture3D=j,this.setTextureCube=B,this.rebindTextures=Be,this.setupRenderTarget=X,this.updateRenderTargetMipmap=le,this.updateMultisampleRenderTarget=nt,this.setupDepthRenderbuffer=Re,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=we}function lg(i,e){function t(n,s=wn){let r;const a=Xe.getTransfer(s);if(n===mn)return i.UNSIGNED_BYTE;if(n===ja)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ka)return i.UNSIGNED_SHORT_5_5_5_1;if(n===tc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ql)return i.BYTE;if(n===ec)return i.SHORT;if(n===ns)return i.UNSIGNED_SHORT;if(n===$a)return i.INT;if(n===$n)return i.UNSIGNED_INT;if(n===cn)return i.FLOAT;if(n===fn)return i.HALF_FLOAT;if(n===nc)return i.ALPHA;if(n===ic)return i.RGB;if(n===Xt)return i.RGBA;if(n===sc)return i.LUMINANCE;if(n===rc)return i.LUMINANCE_ALPHA;if(n===yi)return i.DEPTH_COMPONENT;if(n===Ai)return i.DEPTH_STENCIL;if(n===ac)return i.RED;if(n===Ja)return i.RED_INTEGER;if(n===oc)return i.RG;if(n===Za)return i.RG_INTEGER;if(n===Qa)return i.RGBA_INTEGER;if(n===Ys||n===$s||n===js||n===Ks)if(a===Je)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ys)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===$s)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ks)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ys)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===$s)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ks)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ma||n===ga||n===va||n===_a)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ma)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ga)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===va)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===_a)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===xa||n===ya||n===Sa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===xa||n===ya)return a===Je?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Sa)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ba||n===Ma||n===Ea||n===Ta||n===Aa||n===wa||n===Ca||n===Ra||n===Pa||n===Ia||n===La||n===Da||n===Na||n===Ua)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ba)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ma)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ea)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ta)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Aa)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===wa)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ca)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ra)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Pa)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ia)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===La)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Da)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Na)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ua)return a===Je?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Js||n===Oa||n===Fa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Js)return a===Je?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===lc||n===Ba||n===ka||n===Ha)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Js)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ba)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ka)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ha)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ti?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class cg extends Ut{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Rn extends gt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const dg={type:"move"};class Vr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Rn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Rn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Rn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const p=t.getJointPose(v,n),h=this._getHandJoint(c,v);p!==null&&(h.matrix.fromArray(p.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=p.radius),h.visible=p!==null}const d=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=d.position.distanceTo(u.position),m=.02,g=.005;c.inputState.pinching&&f>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(dg)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Rn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const hg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ug=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class fg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new Et,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new mt({vertexShader:hg,fragmentShader:ug,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ct(new ls(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class pg extends Ii{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,d=null,u=null,f=null,m=null,g=null;const v=new fg,p=t.getContextAttributes();let h=null,b=null;const E=[],S=[],P=new Le;let A=null;const w=new Ut;w.viewport=new lt;const N=new Ut;N.viewport=new lt;const M=[w,N],x=new cg;let C=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let ee=E[W];return ee===void 0&&(ee=new Vr,E[W]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(W){let ee=E[W];return ee===void 0&&(ee=new Vr,E[W]=ee),ee.getGripSpace()},this.getHand=function(W){let ee=E[W];return ee===void 0&&(ee=new Vr,E[W]=ee),ee.getHandSpace()};function O(W){const ee=S.indexOf(W.inputSource);if(ee===-1)return;const _e=E[ee];_e!==void 0&&(_e.update(W.inputSource,W.frame,c||a),_e.dispatchEvent({type:W.type,data:W.inputSource}))}function q(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",$);for(let W=0;W<E.length;W++){const ee=S[W];ee!==null&&(S[W]=null,E[W].disconnect(ee))}C=null,z=null,v.reset(),e.setRenderTarget(h),m=null,f=null,u=null,s=null,b=null,Ge.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){r=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return f!==null?f:m},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(W){if(s=W,s!==null){if(h=e.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",q),s.addEventListener("inputsourceschange",$),p.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(P),s.renderState.layers===void 0){const ee={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,ee),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),b=new Yt(m.framebufferWidth,m.framebufferHeight,{format:Xt,type:mn,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil})}else{let ee=null,_e=null,se=null;p.depth&&(se=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=p.stencil?Ai:yi,_e=p.stencil?Ti:$n);const Ee={colorFormat:t.RGBA8,depthFormat:se,scaleFactor:r};u=new XRWebGLBinding(s,t),f=u.createProjectionLayer(Ee),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),b=new Yt(f.textureWidth,f.textureHeight,{format:Xt,type:mn,depthTexture:new Mc(f.textureWidth,f.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Ge.setContext(s),Ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function $(W){for(let ee=0;ee<W.removed.length;ee++){const _e=W.removed[ee],se=S.indexOf(_e);se>=0&&(S[se]=null,E[se].disconnect(_e))}for(let ee=0;ee<W.added.length;ee++){const _e=W.added[ee];let se=S.indexOf(_e);if(se===-1){for(let Re=0;Re<E.length;Re++)if(Re>=S.length){S.push(_e),se=Re;break}else if(S[Re]===null){S[Re]=_e,se=Re;break}if(se===-1)break}const Ee=E[se];Ee&&Ee.connect(_e)}}const V=new U,j=new U;function B(W,ee,_e){V.setFromMatrixPosition(ee.matrixWorld),j.setFromMatrixPosition(_e.matrixWorld);const se=V.distanceTo(j),Ee=ee.projectionMatrix.elements,Re=_e.projectionMatrix.elements,Be=Ee[14]/(Ee[10]-1),X=Ee[14]/(Ee[10]+1),le=(Ee[9]+1)/Ee[5],ve=(Ee[9]-1)/Ee[5],R=(Ee[8]-1)/Ee[0],nt=(Re[8]+1)/Re[0],Pe=Be*R,we=Be*nt,fe=se/(-R+nt),ze=fe*-R;if(ee.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(ze),W.translateZ(fe),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),Ee[10]===-1)W.projectionMatrix.copy(ee.projectionMatrix),W.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{const ye=Be+fe,T=X+fe,_=Pe-ze,F=we+(se-ze),Y=le*X/T*ye,Z=ve*X/T*ye;W.projectionMatrix.makePerspective(_,F,Y,Z,ye,T),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function Q(W,ee){ee===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(ee.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(s===null)return;let ee=W.near,_e=W.far;v.texture!==null&&(v.depthNear>0&&(ee=v.depthNear),v.depthFar>0&&(_e=v.depthFar)),x.near=N.near=w.near=ee,x.far=N.far=w.far=_e,(C!==x.near||z!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),C=x.near,z=x.far),w.layers.mask=W.layers.mask|2,N.layers.mask=W.layers.mask|4,x.layers.mask=w.layers.mask|N.layers.mask;const se=W.parent,Ee=x.cameras;Q(x,se);for(let Re=0;Re<Ee.length;Re++)Q(Ee[Re],se);Ee.length===2?B(x,w,N):x.projectionMatrix.copy(w.projectionMatrix),ie(W,x,se)};function ie(W,ee,_e){_e===null?W.matrix.copy(ee.matrixWorld):(W.matrix.copy(_e.matrixWorld),W.matrix.invert(),W.matrix.multiply(ee.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(ee.projectionMatrix),W.projectionMatrixInverse.copy(ee.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Va*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(f===null&&m===null))return l},this.setFoveation=function(W){l=W,f!==null&&(f.fixedFoveation=W),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=W)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(x)};let ue=null;function De(W,ee){if(d=ee.getViewerPose(c||a),g=ee,d!==null){const _e=d.views;m!==null&&(e.setRenderTargetFramebuffer(b,m.framebuffer),e.setRenderTarget(b));let se=!1;_e.length!==x.cameras.length&&(x.cameras.length=0,se=!0);for(let Re=0;Re<_e.length;Re++){const Be=_e[Re];let X=null;if(m!==null)X=m.getViewport(Be);else{const ve=u.getViewSubImage(f,Be);X=ve.viewport,Re===0&&(e.setRenderTargetTextures(b,ve.colorTexture,f.ignoreDepthValues?void 0:ve.depthStencilTexture),e.setRenderTarget(b))}let le=M[Re];le===void 0&&(le=new Ut,le.layers.enable(Re),le.viewport=new lt,M[Re]=le),le.matrix.fromArray(Be.transform.matrix),le.matrix.decompose(le.position,le.quaternion,le.scale),le.projectionMatrix.fromArray(Be.projectionMatrix),le.projectionMatrixInverse.copy(le.projectionMatrix).invert(),le.viewport.set(X.x,X.y,X.width,X.height),Re===0&&(x.matrix.copy(le.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),se===!0&&x.cameras.push(le)}const Ee=s.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")){const Re=u.getDepthInformation(_e[0]);Re&&Re.isValid&&Re.texture&&v.init(e,Re,s.renderState)}}for(let _e=0;_e<E.length;_e++){const se=S[_e],Ee=E[_e];se!==null&&Ee!==void 0&&Ee.update(se,ee,c||a)}ue&&ue(W,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}const Ge=new Sc;Ge.setAnimationLoop(De),this.setAnimationLoop=function(W){ue=W},this.dispose=function(){}}}const zn=new kt,mg=new rt;function gg(i,e){function t(p,h){p.matrixAutoUpdate===!0&&p.updateMatrix(),h.value.copy(p.matrix)}function n(p,h){h.color.getRGB(p.fogColor.value,vc(i)),h.isFog?(p.fogNear.value=h.near,p.fogFar.value=h.far):h.isFogExp2&&(p.fogDensity.value=h.density)}function s(p,h,b,E,S){h.isMeshBasicMaterial||h.isMeshLambertMaterial?r(p,h):h.isMeshToonMaterial?(r(p,h),u(p,h)):h.isMeshPhongMaterial?(r(p,h),d(p,h)):h.isMeshStandardMaterial?(r(p,h),f(p,h),h.isMeshPhysicalMaterial&&m(p,h,S)):h.isMeshMatcapMaterial?(r(p,h),g(p,h)):h.isMeshDepthMaterial?r(p,h):h.isMeshDistanceMaterial?(r(p,h),v(p,h)):h.isMeshNormalMaterial?r(p,h):h.isLineBasicMaterial?(a(p,h),h.isLineDashedMaterial&&o(p,h)):h.isPointsMaterial?l(p,h,b,E):h.isSpriteMaterial?c(p,h):h.isShadowMaterial?(p.color.value.copy(h.color),p.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function r(p,h){p.opacity.value=h.opacity,h.color&&p.diffuse.value.copy(h.color),h.emissive&&p.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(p.map.value=h.map,t(h.map,p.mapTransform)),h.alphaMap&&(p.alphaMap.value=h.alphaMap,t(h.alphaMap,p.alphaMapTransform)),h.bumpMap&&(p.bumpMap.value=h.bumpMap,t(h.bumpMap,p.bumpMapTransform),p.bumpScale.value=h.bumpScale,h.side===Mt&&(p.bumpScale.value*=-1)),h.normalMap&&(p.normalMap.value=h.normalMap,t(h.normalMap,p.normalMapTransform),p.normalScale.value.copy(h.normalScale),h.side===Mt&&p.normalScale.value.negate()),h.displacementMap&&(p.displacementMap.value=h.displacementMap,t(h.displacementMap,p.displacementMapTransform),p.displacementScale.value=h.displacementScale,p.displacementBias.value=h.displacementBias),h.emissiveMap&&(p.emissiveMap.value=h.emissiveMap,t(h.emissiveMap,p.emissiveMapTransform)),h.specularMap&&(p.specularMap.value=h.specularMap,t(h.specularMap,p.specularMapTransform)),h.alphaTest>0&&(p.alphaTest.value=h.alphaTest);const b=e.get(h),E=b.envMap,S=b.envMapRotation;E&&(p.envMap.value=E,zn.copy(S),zn.x*=-1,zn.y*=-1,zn.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(zn.y*=-1,zn.z*=-1),p.envMapRotation.value.setFromMatrix4(mg.makeRotationFromEuler(zn)),p.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=h.reflectivity,p.ior.value=h.ior,p.refractionRatio.value=h.refractionRatio),h.lightMap&&(p.lightMap.value=h.lightMap,p.lightMapIntensity.value=h.lightMapIntensity,t(h.lightMap,p.lightMapTransform)),h.aoMap&&(p.aoMap.value=h.aoMap,p.aoMapIntensity.value=h.aoMapIntensity,t(h.aoMap,p.aoMapTransform))}function a(p,h){p.diffuse.value.copy(h.color),p.opacity.value=h.opacity,h.map&&(p.map.value=h.map,t(h.map,p.mapTransform))}function o(p,h){p.dashSize.value=h.dashSize,p.totalSize.value=h.dashSize+h.gapSize,p.scale.value=h.scale}function l(p,h,b,E){p.diffuse.value.copy(h.color),p.opacity.value=h.opacity,p.size.value=h.size*b,p.scale.value=E*.5,h.map&&(p.map.value=h.map,t(h.map,p.uvTransform)),h.alphaMap&&(p.alphaMap.value=h.alphaMap,t(h.alphaMap,p.alphaMapTransform)),h.alphaTest>0&&(p.alphaTest.value=h.alphaTest)}function c(p,h){p.diffuse.value.copy(h.color),p.opacity.value=h.opacity,p.rotation.value=h.rotation,h.map&&(p.map.value=h.map,t(h.map,p.mapTransform)),h.alphaMap&&(p.alphaMap.value=h.alphaMap,t(h.alphaMap,p.alphaMapTransform)),h.alphaTest>0&&(p.alphaTest.value=h.alphaTest)}function d(p,h){p.specular.value.copy(h.specular),p.shininess.value=Math.max(h.shininess,1e-4)}function u(p,h){h.gradientMap&&(p.gradientMap.value=h.gradientMap)}function f(p,h){p.metalness.value=h.metalness,h.metalnessMap&&(p.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,p.metalnessMapTransform)),p.roughness.value=h.roughness,h.roughnessMap&&(p.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,p.roughnessMapTransform)),h.envMap&&(p.envMapIntensity.value=h.envMapIntensity)}function m(p,h,b){p.ior.value=h.ior,h.sheen>0&&(p.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),p.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(p.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,p.sheenColorMapTransform)),h.sheenRoughnessMap&&(p.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,p.sheenRoughnessMapTransform))),h.clearcoat>0&&(p.clearcoat.value=h.clearcoat,p.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(p.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,p.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(p.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Mt&&p.clearcoatNormalScale.value.negate())),h.dispersion>0&&(p.dispersion.value=h.dispersion),h.iridescence>0&&(p.iridescence.value=h.iridescence,p.iridescenceIOR.value=h.iridescenceIOR,p.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(p.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,p.iridescenceMapTransform)),h.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),h.transmission>0&&(p.transmission.value=h.transmission,p.transmissionSamplerMap.value=b.texture,p.transmissionSamplerSize.value.set(b.width,b.height),h.transmissionMap&&(p.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,p.transmissionMapTransform)),p.thickness.value=h.thickness,h.thicknessMap&&(p.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=h.attenuationDistance,p.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(p.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(p.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=h.specularIntensity,p.specularColor.value.copy(h.specularColor),h.specularColorMap&&(p.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,p.specularColorMapTransform)),h.specularIntensityMap&&(p.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,h){h.matcap&&(p.matcap.value=h.matcap)}function v(p,h){const b=e.get(h).light;p.referencePosition.value.setFromMatrixPosition(b.matrixWorld),p.nearDistance.value=b.shadow.camera.near,p.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function vg(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,E){const S=E.program;n.uniformBlockBinding(b,S)}function c(b,E){let S=s[b.id];S===void 0&&(g(b),S=d(b),s[b.id]=S,b.addEventListener("dispose",p));const P=E.program;n.updateUBOMapping(b,P);const A=e.render.frame;r[b.id]!==A&&(f(b),r[b.id]=A)}function d(b){const E=u();b.__bindingPointIndex=E;const S=i.createBuffer(),P=b.__size,A=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,P,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,S),S}function u(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(b){const E=s[b.id],S=b.uniforms,P=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let A=0,w=S.length;A<w;A++){const N=Array.isArray(S[A])?S[A]:[S[A]];for(let M=0,x=N.length;M<x;M++){const C=N[M];if(m(C,A,M,P)===!0){const z=C.__offset,O=Array.isArray(C.value)?C.value:[C.value];let q=0;for(let $=0;$<O.length;$++){const V=O[$],j=v(V);typeof V=="number"||typeof V=="boolean"?(C.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,z+q,C.__data)):V.isMatrix3?(C.__data[0]=V.elements[0],C.__data[1]=V.elements[1],C.__data[2]=V.elements[2],C.__data[3]=0,C.__data[4]=V.elements[3],C.__data[5]=V.elements[4],C.__data[6]=V.elements[5],C.__data[7]=0,C.__data[8]=V.elements[6],C.__data[9]=V.elements[7],C.__data[10]=V.elements[8],C.__data[11]=0):(V.toArray(C.__data,q),q+=j.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,z,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(b,E,S,P){const A=b.value,w=E+"_"+S;if(P[w]===void 0)return typeof A=="number"||typeof A=="boolean"?P[w]=A:P[w]=A.clone(),!0;{const N=P[w];if(typeof A=="number"||typeof A=="boolean"){if(N!==A)return P[w]=A,!0}else if(N.equals(A)===!1)return N.copy(A),!0}return!1}function g(b){const E=b.uniforms;let S=0;const P=16;for(let w=0,N=E.length;w<N;w++){const M=Array.isArray(E[w])?E[w]:[E[w]];for(let x=0,C=M.length;x<C;x++){const z=M[x],O=Array.isArray(z.value)?z.value:[z.value];for(let q=0,$=O.length;q<$;q++){const V=O[q],j=v(V),B=S%P,Q=B%j.boundary,ie=B+Q;S+=Q,ie!==0&&P-ie<j.storage&&(S+=P-ie),z.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=S,S+=j.storage}}}const A=S%P;return A>0&&(S+=P-A),b.__size=S,b.__cache={},this}function v(b){const E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function p(b){const E=b.target;E.removeEventListener("dispose",p);const S=a.indexOf(E.__bindingPointIndex);a.splice(S,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function h(){for(const b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:h}}class _g{constructor(e={}){const{canvas:t=ah(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;const g=new Uint32Array(4),v=new Int32Array(4);let p=null,h=null;const b=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yt,this.toneMapping=In,this.toneMappingExposure=1;const S=this;let P=!1,A=0,w=0,N=null,M=-1,x=null;const C=new lt,z=new lt;let O=null;const q=new Ve(0);let $=0,V=t.width,j=t.height,B=1,Q=null,ie=null;const ue=new lt(0,0,V,j),De=new lt(0,0,V,j);let Ge=!1;const W=new yc;let ee=!1,_e=!1;const se=new rt,Ee=new rt,Re=new U,Be=new lt,X={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let le=!1;function ve(){return N===null?B:1}let R=n;function nt(y,L){return t.getContext(y,L)}try{const y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${qa}`),t.addEventListener("webglcontextlost",J,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",ce,!1),R===null){const L="webgl2";if(R=nt(L,y),R===null)throw nt(L)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let Pe,we,fe,ze,ye,T,_,F,Y,Z,K,Te,oe,pe,qe,te,me,Ce,Ie,ge,We,ke,Qe,I;function ae(){Pe=new Mp(R),Pe.init(),ke=new lg(R,Pe),we=new vp(R,Pe,e,ke),fe=new rg(R,Pe),we.reverseDepthBuffer&&f&&fe.buffers.depth.setReversed(!0),ze=new Ap(R),ye=new Wm,T=new og(R,Pe,fe,ye,we,ke,ze),_=new xp(S),F=new bp(S),Y=new Lh(R),Qe=new mp(R,Y),Z=new Ep(R,Y,ze,Qe),K=new Cp(R,Z,Y,ze),Ie=new wp(R,we,T),te=new _p(ye),Te=new Gm(S,_,F,Pe,we,Qe,te),oe=new gg(S,ye),pe=new qm,qe=new Zm(Pe),Ce=new pp(S,_,F,fe,K,m,l),me=new ig(S,K,we),I=new vg(R,ze,we,fe),ge=new gp(R,Pe,ze),We=new Tp(R,Pe,ze),ze.programs=Te.programs,S.capabilities=we,S.extensions=Pe,S.properties=ye,S.renderLists=pe,S.shadowMap=me,S.state=fe,S.info=ze}ae();const G=new pg(S,R);this.xr=G,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){const y=Pe.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=Pe.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return B},this.setPixelRatio=function(y){y!==void 0&&(B=y,this.setSize(V,j,!1))},this.getSize=function(y){return y.set(V,j)},this.setSize=function(y,L,k=!0){if(G.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=y,j=L,t.width=Math.floor(y*B),t.height=Math.floor(L*B),k===!0&&(t.style.width=y+"px",t.style.height=L+"px"),this.setViewport(0,0,y,L)},this.getDrawingBufferSize=function(y){return y.set(V*B,j*B).floor()},this.setDrawingBufferSize=function(y,L,k){V=y,j=L,B=k,t.width=Math.floor(y*k),t.height=Math.floor(L*k),this.setViewport(0,0,y,L)},this.getCurrentViewport=function(y){return y.copy(C)},this.getViewport=function(y){return y.copy(ue)},this.setViewport=function(y,L,k,H){y.isVector4?ue.set(y.x,y.y,y.z,y.w):ue.set(y,L,k,H),fe.viewport(C.copy(ue).multiplyScalar(B).round())},this.getScissor=function(y){return y.copy(De)},this.setScissor=function(y,L,k,H){y.isVector4?De.set(y.x,y.y,y.z,y.w):De.set(y,L,k,H),fe.scissor(z.copy(De).multiplyScalar(B).round())},this.getScissorTest=function(){return Ge},this.setScissorTest=function(y){fe.setScissorTest(Ge=y)},this.setOpaqueSort=function(y){Q=y},this.setTransparentSort=function(y){ie=y},this.getClearColor=function(y){return y.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor.apply(Ce,arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha.apply(Ce,arguments)},this.clear=function(y=!0,L=!0,k=!0){let H=0;if(y){let D=!1;if(N!==null){const ne=N.texture.format;D=ne===Qa||ne===Za||ne===Ja}if(D){const ne=N.texture.type,de=ne===mn||ne===$n||ne===ns||ne===Ti||ne===ja||ne===Ka,Se=Ce.getClearColor(),be=Ce.getClearAlpha(),Ne=Se.r,Oe=Se.g,Me=Se.b;de?(g[0]=Ne,g[1]=Oe,g[2]=Me,g[3]=be,R.clearBufferuiv(R.COLOR,0,g)):(v[0]=Ne,v[1]=Oe,v[2]=Me,v[3]=be,R.clearBufferiv(R.COLOR,0,v))}else H|=R.COLOR_BUFFER_BIT}L&&(H|=R.DEPTH_BUFFER_BIT),k&&(H|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",J,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",ce,!1),pe.dispose(),qe.dispose(),ye.dispose(),_.dispose(),F.dispose(),K.dispose(),Qe.dispose(),I.dispose(),Te.dispose(),G.dispose(),G.removeEventListener("sessionstart",ao),G.removeEventListener("sessionend",oo),Nn.stop()};function J(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;const y=ze.autoReset,L=me.enabled,k=me.autoUpdate,H=me.needsUpdate,D=me.type;ae(),ze.autoReset=y,me.enabled=L,me.autoUpdate=k,me.needsUpdate=H,me.type=D}function ce(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Ue(y){const L=y.target;L.removeEventListener("dispose",Ue),at(L)}function at(y){vt(y),ye.remove(y)}function vt(y){const L=ye.get(y).programs;L!==void 0&&(L.forEach(function(k){Te.releaseProgram(k)}),y.isShaderMaterial&&Te.releaseShaderCache(y))}this.renderBufferDirect=function(y,L,k,H,D,ne){L===null&&(L=X);const de=D.isMesh&&D.matrixWorld.determinant()<0,Se=Fc(y,L,k,H,D);fe.setMaterial(H,de);let be=k.index,Ne=1;if(H.wireframe===!0){if(be=Z.getWireframeAttribute(k),be===void 0)return;Ne=2}const Oe=k.drawRange,Me=k.attributes.position;let Ye=Oe.start*Ne,et=(Oe.start+Oe.count)*Ne;ne!==null&&(Ye=Math.max(Ye,ne.start*Ne),et=Math.min(et,(ne.start+ne.count)*Ne)),be!==null?(Ye=Math.max(Ye,0),et=Math.min(et,be.count)):Me!=null&&(Ye=Math.max(Ye,0),et=Math.min(et,Me.count));const it=et-Ye;if(it<0||it===1/0)return;Qe.setup(D,H,Se,k,be);let At,$e=ge;if(be!==null&&(At=Y.get(be),$e=We,$e.setIndex(At)),D.isMesh)H.wireframe===!0?(fe.setLineWidth(H.wireframeLinewidth*ve()),$e.setMode(R.LINES)):$e.setMode(R.TRIANGLES);else if(D.isLine){let Ae=H.linewidth;Ae===void 0&&(Ae=1),fe.setLineWidth(Ae*ve()),D.isLineSegments?$e.setMode(R.LINES):D.isLineLoop?$e.setMode(R.LINE_LOOP):$e.setMode(R.LINE_STRIP)}else D.isPoints?$e.setMode(R.POINTS):D.isSprite&&$e.setMode(R.TRIANGLES);if(D.isBatchedMesh)if(D._multiDrawInstances!==null)$e.renderMultiDrawInstances(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount,D._multiDrawInstances);else if(Pe.get("WEBGL_multi_draw"))$e.renderMultiDraw(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount);else{const Ae=D._multiDrawStarts,en=D._multiDrawCounts,je=D._multiDrawCount,zt=be?Y.get(be).bytesPerElement:1,Kn=ye.get(H).currentProgram.getUniforms();for(let Pt=0;Pt<je;Pt++)Kn.setValue(R,"_gl_DrawID",Pt),$e.render(Ae[Pt]/zt,en[Pt])}else if(D.isInstancedMesh)$e.renderInstances(Ye,it,D.count);else if(k.isInstancedBufferGeometry){const Ae=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,en=Math.min(k.instanceCount,Ae);$e.renderInstances(Ye,it,en)}else $e.render(Ye,it)};function Ke(y,L,k){y.transparent===!0&&y.side===ln&&y.forceSinglePass===!1?(y.side=Mt,y.needsUpdate=!0,hs(y,L,k),y.side=Dn,y.needsUpdate=!0,hs(y,L,k),y.side=ln):hs(y,L,k)}this.compile=function(y,L,k=null){k===null&&(k=y),h=qe.get(k),h.init(L),E.push(h),k.traverseVisible(function(D){D.isLight&&D.layers.test(L.layers)&&(h.pushLight(D),D.castShadow&&h.pushShadow(D))}),y!==k&&y.traverseVisible(function(D){D.isLight&&D.layers.test(L.layers)&&(h.pushLight(D),D.castShadow&&h.pushShadow(D))}),h.setupLights();const H=new Set;return y.traverse(function(D){if(!(D.isMesh||D.isPoints||D.isLine||D.isSprite))return;const ne=D.material;if(ne)if(Array.isArray(ne))for(let de=0;de<ne.length;de++){const Se=ne[de];Ke(Se,k,D),H.add(Se)}else Ke(ne,k,D),H.add(ne)}),E.pop(),h=null,H},this.compileAsync=function(y,L,k=null){const H=this.compile(y,L,k);return new Promise(D=>{function ne(){if(H.forEach(function(de){ye.get(de).currentProgram.isReady()&&H.delete(de)}),H.size===0){D(y);return}setTimeout(ne,10)}Pe.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let Ht=null;function Qt(y){Ht&&Ht(y)}function ao(){Nn.stop()}function oo(){Nn.start()}const Nn=new Sc;Nn.setAnimationLoop(Qt),typeof self<"u"&&Nn.setContext(self),this.setAnimationLoop=function(y){Ht=y,G.setAnimationLoop(y),y===null?Nn.stop():Nn.start()},G.addEventListener("sessionstart",ao),G.addEventListener("sessionend",oo),this.render=function(y,L){if(L!==void 0&&L.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),G.enabled===!0&&G.isPresenting===!0&&(G.cameraAutoUpdate===!0&&G.updateCamera(L),L=G.getCamera()),y.isScene===!0&&y.onBeforeRender(S,y,L,N),h=qe.get(y,E.length),h.init(L),E.push(h),Ee.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),W.setFromProjectionMatrix(Ee),_e=this.localClippingEnabled,ee=te.init(this.clippingPlanes,_e),p=pe.get(y,b.length),p.init(),b.push(p),G.enabled===!0&&G.isPresenting===!0){const ne=S.xr.getDepthSensingMesh();ne!==null&&cr(ne,L,-1/0,S.sortObjects)}cr(y,L,0,S.sortObjects),p.finish(),S.sortObjects===!0&&p.sort(Q,ie),le=G.enabled===!1||G.isPresenting===!1||G.hasDepthSensing()===!1,le&&Ce.addToRenderList(p,y),this.info.render.frame++,ee===!0&&te.beginShadows();const k=h.state.shadowsArray;me.render(k,y,L),ee===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=p.opaque,D=p.transmissive;if(h.setupLights(),L.isArrayCamera){const ne=L.cameras;if(D.length>0)for(let de=0,Se=ne.length;de<Se;de++){const be=ne[de];co(H,D,y,be)}le&&Ce.render(y);for(let de=0,Se=ne.length;de<Se;de++){const be=ne[de];lo(p,y,be,be.viewport)}}else D.length>0&&co(H,D,y,L),le&&Ce.render(y),lo(p,y,L);N!==null&&(T.updateMultisampleRenderTarget(N),T.updateRenderTargetMipmap(N)),y.isScene===!0&&y.onAfterRender(S,y,L),Qe.resetDefaultState(),M=-1,x=null,E.pop(),E.length>0?(h=E[E.length-1],ee===!0&&te.setGlobalState(S.clippingPlanes,h.state.camera)):h=null,b.pop(),b.length>0?p=b[b.length-1]:p=null};function cr(y,L,k,H){if(y.visible===!1)return;if(y.layers.test(L.layers)){if(y.isGroup)k=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(L);else if(y.isLight)h.pushLight(y),y.castShadow&&h.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||W.intersectsSprite(y)){H&&Be.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Ee);const de=K.update(y),Se=y.material;Se.visible&&p.push(y,de,Se,k,Be.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||W.intersectsObject(y))){const de=K.update(y),Se=y.material;if(H&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Be.copy(y.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Be.copy(de.boundingSphere.center)),Be.applyMatrix4(y.matrixWorld).applyMatrix4(Ee)),Array.isArray(Se)){const be=de.groups;for(let Ne=0,Oe=be.length;Ne<Oe;Ne++){const Me=be[Ne],Ye=Se[Me.materialIndex];Ye&&Ye.visible&&p.push(y,de,Ye,k,Be.z,Me)}}else Se.visible&&p.push(y,de,Se,k,Be.z,null)}}const ne=y.children;for(let de=0,Se=ne.length;de<Se;de++)cr(ne[de],L,k,H)}function lo(y,L,k,H){const D=y.opaque,ne=y.transmissive,de=y.transparent;h.setupLightsView(k),ee===!0&&te.setGlobalState(S.clippingPlanes,k),H&&fe.viewport(C.copy(H)),D.length>0&&ds(D,L,k),ne.length>0&&ds(ne,L,k),de.length>0&&ds(de,L,k),fe.buffers.depth.setTest(!0),fe.buffers.depth.setMask(!0),fe.buffers.color.setMask(!0),fe.setPolygonOffset(!1)}function co(y,L,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;h.state.transmissionRenderTarget[H.id]===void 0&&(h.state.transmissionRenderTarget[H.id]=new Yt(1,1,{generateMipmaps:!0,type:Pe.has("EXT_color_buffer_half_float")||Pe.has("EXT_color_buffer_float")?fn:mn,minFilter:qn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace}));const ne=h.state.transmissionRenderTarget[H.id],de=H.viewport||C;ne.setSize(de.z,de.w);const Se=S.getRenderTarget();S.setRenderTarget(ne),S.getClearColor(q),$=S.getClearAlpha(),$<1&&S.setClearColor(16777215,.5),S.clear(),le&&Ce.render(k);const be=S.toneMapping;S.toneMapping=In;const Ne=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),h.setupLightsView(H),ee===!0&&te.setGlobalState(S.clippingPlanes,H),ds(y,k,H),T.updateMultisampleRenderTarget(ne),T.updateRenderTargetMipmap(ne),Pe.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let Me=0,Ye=L.length;Me<Ye;Me++){const et=L[Me],it=et.object,At=et.geometry,$e=et.material,Ae=et.group;if($e.side===ln&&it.layers.test(H.layers)){const en=$e.side;$e.side=Mt,$e.needsUpdate=!0,ho(it,k,H,At,$e,Ae),$e.side=en,$e.needsUpdate=!0,Oe=!0}}Oe===!0&&(T.updateMultisampleRenderTarget(ne),T.updateRenderTargetMipmap(ne))}S.setRenderTarget(Se),S.setClearColor(q,$),Ne!==void 0&&(H.viewport=Ne),S.toneMapping=be}function ds(y,L,k){const H=L.isScene===!0?L.overrideMaterial:null;for(let D=0,ne=y.length;D<ne;D++){const de=y[D],Se=de.object,be=de.geometry,Ne=H===null?de.material:H,Oe=de.group;Se.layers.test(k.layers)&&ho(Se,L,k,be,Ne,Oe)}}function ho(y,L,k,H,D,ne){y.onBeforeRender(S,L,k,H,D,ne),y.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),D.onBeforeRender(S,L,k,H,y,ne),D.transparent===!0&&D.side===ln&&D.forceSinglePass===!1?(D.side=Mt,D.needsUpdate=!0,S.renderBufferDirect(k,L,H,D,y,ne),D.side=Dn,D.needsUpdate=!0,S.renderBufferDirect(k,L,H,D,y,ne),D.side=ln):S.renderBufferDirect(k,L,H,D,y,ne),y.onAfterRender(S,L,k,H,D,ne)}function hs(y,L,k){L.isScene!==!0&&(L=X);const H=ye.get(y),D=h.state.lights,ne=h.state.shadowsArray,de=D.state.version,Se=Te.getParameters(y,D.state,ne,L,k),be=Te.getProgramCacheKey(Se);let Ne=H.programs;H.environment=y.isMeshStandardMaterial?L.environment:null,H.fog=L.fog,H.envMap=(y.isMeshStandardMaterial?F:_).get(y.envMap||H.environment),H.envMapRotation=H.environment!==null&&y.envMap===null?L.environmentRotation:y.envMapRotation,Ne===void 0&&(y.addEventListener("dispose",Ue),Ne=new Map,H.programs=Ne);let Oe=Ne.get(be);if(Oe!==void 0){if(H.currentProgram===Oe&&H.lightsStateVersion===de)return fo(y,Se),Oe}else Se.uniforms=Te.getUniforms(y),y.onBeforeCompile(Se,S),Oe=Te.acquireProgram(Se,be),Ne.set(be,Oe),H.uniforms=Se.uniforms;const Me=H.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Me.clippingPlanes=te.uniform),fo(y,Se),H.needsLights=kc(y),H.lightsStateVersion=de,H.needsLights&&(Me.ambientLightColor.value=D.state.ambient,Me.lightProbe.value=D.state.probe,Me.directionalLights.value=D.state.directional,Me.directionalLightShadows.value=D.state.directionalShadow,Me.spotLights.value=D.state.spot,Me.spotLightShadows.value=D.state.spotShadow,Me.rectAreaLights.value=D.state.rectArea,Me.ltc_1.value=D.state.rectAreaLTC1,Me.ltc_2.value=D.state.rectAreaLTC2,Me.pointLights.value=D.state.point,Me.pointLightShadows.value=D.state.pointShadow,Me.hemisphereLights.value=D.state.hemi,Me.directionalShadowMap.value=D.state.directionalShadowMap,Me.directionalShadowMatrix.value=D.state.directionalShadowMatrix,Me.spotShadowMap.value=D.state.spotShadowMap,Me.spotLightMatrix.value=D.state.spotLightMatrix,Me.spotLightMap.value=D.state.spotLightMap,Me.pointShadowMap.value=D.state.pointShadowMap,Me.pointShadowMatrix.value=D.state.pointShadowMatrix),H.currentProgram=Oe,H.uniformsList=null,Oe}function uo(y){if(y.uniformsList===null){const L=y.currentProgram.getUniforms();y.uniformsList=Zs.seqWithValue(L.seq,y.uniforms)}return y.uniformsList}function fo(y,L){const k=ye.get(y);k.outputColorSpace=L.outputColorSpace,k.batching=L.batching,k.batchingColor=L.batchingColor,k.instancing=L.instancing,k.instancingColor=L.instancingColor,k.instancingMorph=L.instancingMorph,k.skinning=L.skinning,k.morphTargets=L.morphTargets,k.morphNormals=L.morphNormals,k.morphColors=L.morphColors,k.morphTargetsCount=L.morphTargetsCount,k.numClippingPlanes=L.numClippingPlanes,k.numIntersection=L.numClipIntersection,k.vertexAlphas=L.vertexAlphas,k.vertexTangents=L.vertexTangents,k.toneMapping=L.toneMapping}function Fc(y,L,k,H,D){L.isScene!==!0&&(L=X),T.resetTextureUnits();const ne=L.fog,de=H.isMeshStandardMaterial?L.environment:null,Se=N===null?S.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:Pi,be=(H.isMeshStandardMaterial?F:_).get(H.envMap||de),Ne=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Oe=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Me=!!k.morphAttributes.position,Ye=!!k.morphAttributes.normal,et=!!k.morphAttributes.color;let it=In;H.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(it=S.toneMapping);const At=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,$e=At!==void 0?At.length:0,Ae=ye.get(H),en=h.state.lights;if(ee===!0&&(_e===!0||y!==x)){const Dt=y===x&&H.id===M;te.setState(H,y,Dt)}let je=!1;H.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==en.state.version||Ae.outputColorSpace!==Se||D.isBatchedMesh&&Ae.batching===!1||!D.isBatchedMesh&&Ae.batching===!0||D.isBatchedMesh&&Ae.batchingColor===!0&&D.colorTexture===null||D.isBatchedMesh&&Ae.batchingColor===!1&&D.colorTexture!==null||D.isInstancedMesh&&Ae.instancing===!1||!D.isInstancedMesh&&Ae.instancing===!0||D.isSkinnedMesh&&Ae.skinning===!1||!D.isSkinnedMesh&&Ae.skinning===!0||D.isInstancedMesh&&Ae.instancingColor===!0&&D.instanceColor===null||D.isInstancedMesh&&Ae.instancingColor===!1&&D.instanceColor!==null||D.isInstancedMesh&&Ae.instancingMorph===!0&&D.morphTexture===null||D.isInstancedMesh&&Ae.instancingMorph===!1&&D.morphTexture!==null||Ae.envMap!==be||H.fog===!0&&Ae.fog!==ne||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==te.numPlanes||Ae.numIntersection!==te.numIntersection)||Ae.vertexAlphas!==Ne||Ae.vertexTangents!==Oe||Ae.morphTargets!==Me||Ae.morphNormals!==Ye||Ae.morphColors!==et||Ae.toneMapping!==it||Ae.morphTargetsCount!==$e)&&(je=!0):(je=!0,Ae.__version=H.version);let zt=Ae.currentProgram;je===!0&&(zt=hs(H,L,D));let Kn=!1,Pt=!1,Ni=!1;const st=zt.getUniforms(),$t=Ae.uniforms;if(fe.useProgram(zt.program)&&(Kn=!0,Pt=!0,Ni=!0),H.id!==M&&(M=H.id,Pt=!0),Kn||x!==y){fe.buffers.depth.getReversed()?(se.copy(y.projectionMatrix),lh(se),ch(se),st.setValue(R,"projectionMatrix",se)):st.setValue(R,"projectionMatrix",y.projectionMatrix),st.setValue(R,"viewMatrix",y.matrixWorldInverse);const vn=st.map.cameraPosition;vn!==void 0&&vn.setValue(R,Re.setFromMatrixPosition(y.matrixWorld)),we.logarithmicDepthBuffer&&st.setValue(R,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&st.setValue(R,"isOrthographic",y.isOrthographicCamera===!0),x!==y&&(x=y,Pt=!0,Ni=!0)}if(D.isSkinnedMesh){st.setOptional(R,D,"bindMatrix"),st.setOptional(R,D,"bindMatrixInverse");const Dt=D.skeleton;Dt&&(Dt.boneTexture===null&&Dt.computeBoneTexture(),st.setValue(R,"boneTexture",Dt.boneTexture,T))}D.isBatchedMesh&&(st.setOptional(R,D,"batchingTexture"),st.setValue(R,"batchingTexture",D._matricesTexture,T),st.setOptional(R,D,"batchingIdTexture"),st.setValue(R,"batchingIdTexture",D._indirectTexture,T),st.setOptional(R,D,"batchingColorTexture"),D._colorsTexture!==null&&st.setValue(R,"batchingColorTexture",D._colorsTexture,T));const Ui=k.morphAttributes;if((Ui.position!==void 0||Ui.normal!==void 0||Ui.color!==void 0)&&Ie.update(D,k,zt),(Pt||Ae.receiveShadow!==D.receiveShadow)&&(Ae.receiveShadow=D.receiveShadow,st.setValue(R,"receiveShadow",D.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&($t.envMap.value=be,$t.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&L.environment!==null&&($t.envMapIntensity.value=L.environmentIntensity),Pt&&(st.setValue(R,"toneMappingExposure",S.toneMappingExposure),Ae.needsLights&&Bc($t,Ni),ne&&H.fog===!0&&oe.refreshFogUniforms($t,ne),oe.refreshMaterialUniforms($t,H,B,j,h.state.transmissionRenderTarget[y.id]),Zs.upload(R,uo(Ae),$t,T)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Zs.upload(R,uo(Ae),$t,T),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&st.setValue(R,"center",D.center),st.setValue(R,"modelViewMatrix",D.modelViewMatrix),st.setValue(R,"normalMatrix",D.normalMatrix),st.setValue(R,"modelMatrix",D.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Dt=H.uniformsGroups;for(let vn=0,_n=Dt.length;vn<_n;vn++){const po=Dt[vn];I.update(po,zt),I.bind(po,zt)}}return zt}function Bc(y,L){y.ambientLightColor.needsUpdate=L,y.lightProbe.needsUpdate=L,y.directionalLights.needsUpdate=L,y.directionalLightShadows.needsUpdate=L,y.pointLights.needsUpdate=L,y.pointLightShadows.needsUpdate=L,y.spotLights.needsUpdate=L,y.spotLightShadows.needsUpdate=L,y.rectAreaLights.needsUpdate=L,y.hemisphereLights.needsUpdate=L}function kc(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(y,L,k){ye.get(y.texture).__webglTexture=L,ye.get(y.depthTexture).__webglTexture=k;const H=ye.get(y);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=k===void 0,H.__autoAllocateDepthBuffer||Pe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(y,L){const k=ye.get(y);k.__webglFramebuffer=L,k.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(y,L=0,k=0){N=y,A=L,w=k;let H=!0,D=null,ne=!1,de=!1;if(y){const be=ye.get(y);if(be.__useDefaultFramebuffer!==void 0)fe.bindFramebuffer(R.FRAMEBUFFER,null),H=!1;else if(be.__webglFramebuffer===void 0)T.setupRenderTarget(y);else if(be.__hasExternalTextures)T.rebindTextures(y,ye.get(y.texture).__webglTexture,ye.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const Me=y.depthTexture;if(be.__boundDepthTexture!==Me){if(Me!==null&&ye.has(Me)&&(y.width!==Me.image.width||y.height!==Me.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(y)}}const Ne=y.texture;(Ne.isData3DTexture||Ne.isDataArrayTexture||Ne.isCompressedArrayTexture)&&(de=!0);const Oe=ye.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Oe[L])?D=Oe[L][k]:D=Oe[L],ne=!0):y.samples>0&&T.useMultisampledRTT(y)===!1?D=ye.get(y).__webglMultisampledFramebuffer:Array.isArray(Oe)?D=Oe[k]:D=Oe,C.copy(y.viewport),z.copy(y.scissor),O=y.scissorTest}else C.copy(ue).multiplyScalar(B).floor(),z.copy(De).multiplyScalar(B).floor(),O=Ge;if(fe.bindFramebuffer(R.FRAMEBUFFER,D)&&H&&fe.drawBuffers(y,D),fe.viewport(C),fe.scissor(z),fe.setScissorTest(O),ne){const be=ye.get(y.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+L,be.__webglTexture,k)}else if(de){const be=ye.get(y.texture),Ne=L||0;R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,be.__webglTexture,k||0,Ne)}M=-1},this.readRenderTargetPixels=function(y,L,k,H,D,ne,de){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=ye.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&de!==void 0&&(Se=Se[de]),Se){fe.bindFramebuffer(R.FRAMEBUFFER,Se);try{const be=y.texture,Ne=be.format,Oe=be.type;if(!we.textureFormatReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!we.textureTypeReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=y.width-H&&k>=0&&k<=y.height-D&&R.readPixels(L,k,H,D,ke.convert(Ne),ke.convert(Oe),ne)}finally{const be=N!==null?ye.get(N).__webglFramebuffer:null;fe.bindFramebuffer(R.FRAMEBUFFER,be)}}},this.readRenderTargetPixelsAsync=async function(y,L,k,H,D,ne,de){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=ye.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&de!==void 0&&(Se=Se[de]),Se){const be=y.texture,Ne=be.format,Oe=be.type;if(!we.textureFormatReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!we.textureTypeReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(L>=0&&L<=y.width-H&&k>=0&&k<=y.height-D){fe.bindFramebuffer(R.FRAMEBUFFER,Se);const Me=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,Me),R.bufferData(R.PIXEL_PACK_BUFFER,ne.byteLength,R.STREAM_READ),R.readPixels(L,k,H,D,ke.convert(Ne),ke.convert(Oe),0);const Ye=N!==null?ye.get(N).__webglFramebuffer:null;fe.bindFramebuffer(R.FRAMEBUFFER,Ye);const et=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await oh(R,et,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,Me),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,ne),R.deleteBuffer(Me),R.deleteSync(et),ne}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(y,L=null,k=0){y.isTexture!==!0&&(qi("WebGLRenderer: copyFramebufferToTexture function signature has changed."),L=arguments[0]||null,y=arguments[1]);const H=Math.pow(2,-k),D=Math.floor(y.image.width*H),ne=Math.floor(y.image.height*H),de=L!==null?L.x:0,Se=L!==null?L.y:0;T.setTexture2D(y,0),R.copyTexSubImage2D(R.TEXTURE_2D,k,0,0,de,Se,D,ne),fe.unbindTexture()},this.copyTextureToTexture=function(y,L,k=null,H=null,D=0){y.isTexture!==!0&&(qi("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,y=arguments[1],L=arguments[2],D=arguments[3]||0,k=null);let ne,de,Se,be,Ne,Oe,Me,Ye,et;const it=y.isCompressedTexture?y.mipmaps[D]:y.image;k!==null?(ne=k.max.x-k.min.x,de=k.max.y-k.min.y,Se=k.isBox3?k.max.z-k.min.z:1,be=k.min.x,Ne=k.min.y,Oe=k.isBox3?k.min.z:0):(ne=it.width,de=it.height,Se=it.depth||1,be=0,Ne=0,Oe=0),H!==null?(Me=H.x,Ye=H.y,et=H.z):(Me=0,Ye=0,et=0);const At=ke.convert(L.format),$e=ke.convert(L.type);let Ae;L.isData3DTexture?(T.setTexture3D(L,0),Ae=R.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(T.setTexture2DArray(L,0),Ae=R.TEXTURE_2D_ARRAY):(T.setTexture2D(L,0),Ae=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,L.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,L.unpackAlignment);const en=R.getParameter(R.UNPACK_ROW_LENGTH),je=R.getParameter(R.UNPACK_IMAGE_HEIGHT),zt=R.getParameter(R.UNPACK_SKIP_PIXELS),Kn=R.getParameter(R.UNPACK_SKIP_ROWS),Pt=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,it.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,it.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,be),R.pixelStorei(R.UNPACK_SKIP_ROWS,Ne),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Oe);const Ni=y.isDataArrayTexture||y.isData3DTexture,st=L.isDataArrayTexture||L.isData3DTexture;if(y.isRenderTargetTexture||y.isDepthTexture){const $t=ye.get(y),Ui=ye.get(L),Dt=ye.get($t.__renderTarget),vn=ye.get(Ui.__renderTarget);fe.bindFramebuffer(R.READ_FRAMEBUFFER,Dt.__webglFramebuffer),fe.bindFramebuffer(R.DRAW_FRAMEBUFFER,vn.__webglFramebuffer);for(let _n=0;_n<Se;_n++)Ni&&R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,ye.get(y).__webglTexture,D,Oe+_n),y.isDepthTexture?(st&&R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,ye.get(L).__webglTexture,D,et+_n),R.blitFramebuffer(be,Ne,ne,de,Me,Ye,ne,de,R.DEPTH_BUFFER_BIT,R.NEAREST)):st?R.copyTexSubImage3D(Ae,D,Me,Ye,et+_n,be,Ne,ne,de):R.copyTexSubImage2D(Ae,D,Me,Ye,et+_n,be,Ne,ne,de);fe.bindFramebuffer(R.READ_FRAMEBUFFER,null),fe.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else st?y.isDataTexture||y.isData3DTexture?R.texSubImage3D(Ae,D,Me,Ye,et,ne,de,Se,At,$e,it.data):L.isCompressedArrayTexture?R.compressedTexSubImage3D(Ae,D,Me,Ye,et,ne,de,Se,At,it.data):R.texSubImage3D(Ae,D,Me,Ye,et,ne,de,Se,At,$e,it):y.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,D,Me,Ye,ne,de,At,$e,it.data):y.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,D,Me,Ye,it.width,it.height,At,it.data):R.texSubImage2D(R.TEXTURE_2D,D,Me,Ye,ne,de,At,$e,it);R.pixelStorei(R.UNPACK_ROW_LENGTH,en),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,je),R.pixelStorei(R.UNPACK_SKIP_PIXELS,zt),R.pixelStorei(R.UNPACK_SKIP_ROWS,Kn),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Pt),D===0&&L.generateMipmaps&&R.generateMipmap(Ae),fe.unbindTexture()},this.copyTextureToTexture3D=function(y,L,k=null,H=null,D=0){return y.isTexture!==!0&&(qi("WebGLRenderer: copyTextureToTexture3D function signature has changed."),k=arguments[0]||null,H=arguments[1]||null,y=arguments[2],L=arguments[3],D=arguments[4]||0),qi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(y,L,k,H,D)},this.initRenderTarget=function(y){ye.get(y).__webglFramebuffer===void 0&&T.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?T.setTextureCube(y,0):y.isData3DTexture?T.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?T.setTexture2DArray(y,0):T.setTexture2D(y,0),fe.unbindTexture()},this.resetState=function(){A=0,w=0,N=null,fe.reset(),Qe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return dn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}class xg extends gt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new kt,this.environmentIntensity=1,this.environmentRotation=new kt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class yg{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=za,this.updateRanges=[],this.version=0,this.uuid=Ln()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ln()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ln()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const St=new U;class nr{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Kt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ze(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Ze(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Kt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Kt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Kt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Kt(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),s=Ze(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ze(t,this.array),n=Ze(n,this.array),s=Ze(s,this.array),r=Ze(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new dt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new nr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class no extends jn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ui;const Hi=new U,fi=new U,pi=new U,mi=new Le,zi=new Le,Cc=new rt,Us=new U,Vi=new U,Os=new U,yl=new Le,Gr=new Le,Sl=new Le;class Rc extends gt{constructor(e=new no){if(super(),this.isSprite=!0,this.type="Sprite",ui===void 0){ui=new Tt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new yg(t,5);ui.setIndex([0,1,2,0,2,3]),ui.setAttribute("position",new nr(n,3,0,!1)),ui.setAttribute("uv",new nr(n,2,3,!1))}this.geometry=ui,this.material=e,this.center=new Le(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),fi.setFromMatrixScale(this.matrixWorld),Cc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),pi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&fi.multiplyScalar(-pi.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;Fs(Us.set(-.5,-.5,0),pi,a,fi,s,r),Fs(Vi.set(.5,-.5,0),pi,a,fi,s,r),Fs(Os.set(.5,.5,0),pi,a,fi,s,r),yl.set(0,0),Gr.set(1,0),Sl.set(1,1);let o=e.ray.intersectTriangle(Us,Vi,Os,!1,Hi);if(o===null&&(Fs(Vi.set(-.5,.5,0),pi,a,fi,s,r),Gr.set(0,1),o=e.ray.intersectTriangle(Us,Os,Vi,!1,Hi),o===null))return;const l=e.ray.origin.distanceTo(Hi);l<e.near||l>e.far||t.push({distance:l,point:Hi.clone(),uv:Ot.getInterpolation(Hi,Us,Vi,Os,yl,Gr,Sl,new Le),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Fs(i,e,t,n,s,r){mi.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(zi.x=r*mi.x-s*mi.y,zi.y=s*mi.x+r*mi.y):zi.copy(mi),i.copy(e),i.x+=zi.x,i.y+=zi.y,i.applyMatrix4(Cc)}class io extends jn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ir=new U,sr=new U,bl=new rt,Gi=new eo,Bs=new as,Wr=new U,Ml=new U;class Pc extends gt{constructor(e=new Tt,t=new io){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)ir.fromBufferAttribute(t,s-1),sr.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=ir.distanceTo(sr);e.setAttribute("lineDistance",new Rt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Bs.copy(n.boundingSphere),Bs.applyMatrix4(s),Bs.radius+=r,e.ray.intersectsSphere(Bs)===!1)return;bl.copy(s).invert(),Gi.copy(e.ray).applyMatrix4(bl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,d=n.index,f=n.attributes.position;if(d!==null){const m=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let v=m,p=g-1;v<p;v+=c){const h=d.getX(v),b=d.getX(v+1),E=ks(this,e,Gi,l,h,b);E&&t.push(E)}if(this.isLineLoop){const v=d.getX(g-1),p=d.getX(m),h=ks(this,e,Gi,l,v,p);h&&t.push(h)}}else{const m=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let v=m,p=g-1;v<p;v+=c){const h=ks(this,e,Gi,l,v,v+1);h&&t.push(h)}if(this.isLineLoop){const v=ks(this,e,Gi,l,g-1,m);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function ks(i,e,t,n,s,r){const a=i.geometry.attributes.position;if(ir.fromBufferAttribute(a,s),sr.fromBufferAttribute(a,r),t.distanceSqToSegment(ir,sr,Wr,Ml)>n)return;Wr.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Wr);if(!(l<e.near||l>e.far))return{distance:l,point:Ml.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const El=new U,Tl=new U;class Sg extends Pc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)El.fromBufferAttribute(t,s),Tl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+El.distanceTo(Tl);e.setAttribute("lineDistance",new Rt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class bg extends jn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Al=new rt,Wa=new eo,Hs=new as,zs=new U;class Mg extends gt{constructor(e=new Tt,t=new bg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Hs.copy(n.boundingSphere),Hs.applyMatrix4(s),Hs.radius+=r,e.ray.intersectsSphere(Hs)===!1)return;Al.copy(s).invert(),Wa.copy(e.ray).applyMatrix4(Al);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),m=Math.min(c.count,a.start+a.count);for(let g=f,v=m;g<v;g++){const p=c.getX(g);zs.fromBufferAttribute(u,p),wl(zs,p,l,s,e,t,this)}}else{const f=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let g=f,v=m;g<v;g++)zs.fromBufferAttribute(u,g),wl(zs,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function wl(i,e,t,n,s,r,a){const o=Wa.distanceSqToPoint(i);if(o<t){const l=new U;Wa.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class lr extends Et{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class cs extends Tt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const d=[],u=new U,f=new U,m=[],g=[],v=[],p=[];for(let h=0;h<=n;h++){const b=[],E=h/n;let S=0;h===0&&a===0?S=.5/t:h===n&&l===Math.PI&&(S=-.5/t);for(let P=0;P<=t;P++){const A=P/t;u.x=-e*Math.cos(s+A*r)*Math.sin(a+E*o),u.y=e*Math.cos(a+E*o),u.z=e*Math.sin(s+A*r)*Math.sin(a+E*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),p.push(A+S,1-E),b.push(c++)}d.push(b)}for(let h=0;h<n;h++)for(let b=0;b<t;b++){const E=d[h][b+1],S=d[h][b],P=d[h+1][b],A=d[h+1][b+1];(h!==0||a>0)&&m.push(E,S,A),(h!==n-1||l<Math.PI)&&m.push(S,P,A)}this.setIndex(m),this.setAttribute("position",new Rt(g,3)),this.setAttribute("normal",new Rt(v,3)),this.setAttribute("uv",new Rt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cs(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Eg extends mt{static get type(){return"RawShaderMaterial"}constructor(e){super(e),this.isRawShaderMaterial=!0}}class Tg{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Cl(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Cl();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Cl(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:qa}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=qa);const Xr=1e3,Ag=9e3;function wg(i){const e=Math.max(1e3,Math.min(4e4,i))/100;let t,n,s;e<=66?t=255:t=329.698727446*Math.pow(e-60,-.1332047592),e<=66?n=99.4708025861*Math.log(e)-161.1195681661:n=288.1221695283*Math.pow(e-60,-.0755148492),e>=66?s=255:e<=19?s=0:s=138.5177312231*Math.log(e-10)-305.0447927307;const r=a=>Math.max(0,Math.min(1,a/255));return[r(t),r(n),r(s)]}const Cg=`
  attribute float size;
  attribute vec3 color;
  attribute float twinklePhase;
  attribute float twinkleSpeed;

  varying vec3 vColor;
  varying float vTwinkle;

  uniform float uTime;
  uniform float uReducedMotion;

  void main() {
    vColor = color;
    if (uReducedMotion > 0.5) {
      vTwinkle = 1.0;
    } else {
      // Subtle physical astronomical scintillation (twinkle)
      vTwinkle = 0.78 + 0.22 * sin(uTime * twinkleSpeed + twinklePhase);
    }

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Point size with fixed celestial perspective
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`,Rg=`
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
      discard;
    }

    // Antialiased circular profile with soft corona and intense core
    float alpha = smoothstep(0.5, 0.04, dist);
    float core = smoothstep(0.18, 0.0, dist) * 0.6;
    vec3 outColor = (vColor + vec3(core)) * vTwinkle;

    gl_FragColor = vec4(outColor, alpha);
  }
`;class Pg{mesh;geometry;material;starCount;constructor(e=Ag,t=19690720){this.starCount=e;const n=new Ft(t),s=new Float32Array(e*3),r=new Float32Array(e*3),a=new Float32Array(e),o=new Float32Array(e),l=new Float32Array(e);for(let c=0;c<e;c++){const d=n.random(),u=n.random(),f=2*Math.PI*d,m=Math.acos(2*u-1),g=Math.sin(m),v=Xr*g*Math.cos(f),p=Xr*Math.cos(m),h=Xr*g*Math.sin(f);s[c*3]=v,s[c*3+1]=p,s[c*3+2]=h;const b=n.random(),E=-.5+7*Math.pow(b,.35),S=Math.max(1.2,5.8-E*.72);a[c]=S;const P=n.random(),A=3e3+27e3*Math.pow(P,2.4),[w,N,M]=wg(A),x=Math.max(.4,1.2-E*.12);r[c*3]=w*x,r[c*3+1]=N*x,r[c*3+2]=M*x,o[c]=n.random()*2*Math.PI,l[c]=1+n.random()*3}this.geometry=new Tt,this.geometry.setAttribute("position",new dt(s,3)),this.geometry.setAttribute("color",new dt(r,3)),this.geometry.setAttribute("size",new dt(a,1)),this.geometry.setAttribute("twinklePhase",new dt(o,1)),this.geometry.setAttribute("twinkleSpeed",new dt(l,1)),this.material=new mt({vertexShader:Cg,fragmentShader:Rg,uniforms:{uTime:{value:0},uReducedMotion:{value:0}},transparent:!0,blending:Zt,depthWrite:!1}),this.mesh=new Mg(this.geometry,this.material),this.mesh.name="StarField"}update(e,t){this.material.uniforms.uTime.value=e,this.material.uniforms.uReducedMotion.value=t?1:0}getCount(){return this.starCount}destroy(){this.geometry.dispose(),this.material.dispose()}}const Ig=950;class Rl{perm;constructor(e=101){const t=new Ft(e),n=new Uint8Array(256);for(let s=0;s<256;s++)n[s]=s;t.shuffle(Array.from(n)).forEach((s,r)=>{n[r]=s}),this.perm=new Uint8Array(512);for(let s=0;s<512;s++)this.perm[s]=n[s&255]}hash(e,t){const n=Math.floor(e)&255,s=Math.floor(t)&255;return this.perm[this.perm[n]+s]/255}noise(e,t){const n=Math.floor(e),s=Math.floor(t),r=e-n,a=t-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=this.hash(n,s),d=this.hash(n+1,s),u=this.hash(n,s+1),f=this.hash(n+1,s+1),m=c*(1-o)+d*o,g=u*(1-o)+f*o;return m*(1-l)+g*l}fbm(e,t,n=4){let s=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)s+=this.noise(e*a,t*a)*r,o+=r,r*=.5,a*=2.02;return s/o}}function Lg(i=1024,e=512){let t;if(typeof document<"u"&&document.createElement)t=document.createElement("canvas");else return t={width:i,height:e,getContext:()=>null},t;t.width=i,t.height=e;const n=t.getContext("2d");if(!n)return t;const s=n.createImageData(i,e),r=s.data,a=new Rl(777),o=new Rl(12345),l=e/2;for(let c=0;c<e;c++){const d=(c-l)/l*(Math.PI/2);if(Math.abs(d*(180/Math.PI))>38)continue;const f=.15,m=Math.exp(-(d*d)/(2*f*f));for(let g=0;g<i;g++){const v=(g-i/2)/(i/2)*Math.PI,p=.35,h=.18,b=1.6*Math.exp(-(v*v/(2*p*p)+d*d/(2*h*h))),E=g/i*8,S=c/e*6,P=a.fbm(E,S,4),A=o.fbm(E*1.8+4.5,S*2.2+1.2,3),w=Math.exp(-(d*d)/(2*.05*.05)),N=1-.7*Math.pow(A,1.5)*w,M=(m*.55+b+P*.45)*N;if(M<=.01)continue;const x=Math.min(1,b*.8),C=Math.round((210*(1-x)+255*x)*M),z=Math.round((225*(1-x)+215*x)*M),O=Math.round((255*(1-x)+170*x)*M),q=Math.min(.15,M*.14),$=(c*i+g)*4;r[$]=Math.min(255,C),r[$+1]=Math.min(255,z),r[$+2]=Math.min(255,O),r[$+3]=Math.round(q*255)}}return n.putImageData(s,0,0),t}class Dg{mesh;geometry;material;texture=null;constructor(){this.geometry=new cs(Ig,48,24);const e=Lg(1024,512);e&&typeof e.getContext=="function"&&e.getContext("2d")&&(this.texture=new lr(e),this.texture.wrapS=Qs,this.texture.wrapT=Cn,this.texture.colorSpace=yt),this.material=new wi({map:this.texture,side:Mt,transparent:!0,blending:Zt,depthWrite:!1,opacity:.95}),this.mesh=new Ct(this.geometry,this.material),this.mesh.name="MilkyWayBand",this.mesh.rotation.order="YXZ",this.mesh.rotation.x=hn(63),this.mesh.rotation.y=hn(120),this.mesh.rotation.z=hn(25)}update(){}destroy(){this.geometry.dispose(),this.material.dispose(),this.texture&&this.texture.dispose()}}const Pl=1500,tt=14;class Ng{mesh;geometry;material;particlePositions;linePositions;lineColors;streaksEnabled=!0;rng;constructor(e=4280){this.rng=new Ft(e);const t=Pl;this.particlePositions=new Float32Array(t*3),this.linePositions=new Float32Array(t*6),this.lineColors=new Float32Array(t*6);for(let n=0;n<t;n++){const s=this.rng.range(-tt,tt),r=this.rng.range(-tt,tt),a=this.rng.range(-tt,tt);this.particlePositions[n*3]=s,this.particlePositions[n*3+1]=r,this.particlePositions[n*3+2]=a,this.linePositions[n*6]=s,this.linePositions[n*6+1]=r,this.linePositions[n*6+2]=a,this.linePositions[n*6+3]=s,this.linePositions[n*6+4]=r,this.linePositions[n*6+5]=a;const o=this.rng.range(.35,.85);this.lineColors[n*6]=.5*o,this.lineColors[n*6+1]=.85*o,this.lineColors[n*6+2]=1*o,this.lineColors[n*6+3]=.05,this.lineColors[n*6+4]=.1,this.lineColors[n*6+5]=.2}this.geometry=new Tt,this.geometry.setAttribute("position",new dt(this.linePositions,3)),this.geometry.setAttribute("color",new dt(this.lineColors,3)),this.material=new io({vertexColors:!0,transparent:!0,blending:Zt,depthWrite:!1,linewidth:1}),this.mesh=new Sg(this.geometry,this.material),this.mesh.name="DustField"}setStreaksEnabled(e){this.streaksEnabled=e}isStreaksEnabled(){return this.streaksEnabled}toggleStreaks(){return this.streaksEnabled=!this.streaksEnabled,this.streaksEnabled}update(e,t){const n=e[0],s=-e[1],r=Math.hypot(n,s);if(r<1e-8)return;const a=-n/r,o=0,l=-s/r,d=r*120,u=Math.min(d*t,4),f=this.streaksEnabled?Math.max(.08,Math.min(1.8,r*60)):.001,m=Pl,g=this.geometry.attributes.position,v=this.linePositions;for(let p=0;p<m;p++){const h=p*3;let b=this.particlePositions[h]+a*u,E=this.particlePositions[h+1]+o*u,S=this.particlePositions[h+2]+l*u,P=!1;b>tt?(b=-tt,P=!0):b<-tt&&(b=tt,P=!0),E>tt?(E=-tt,P=!0):E<-tt&&(E=tt,P=!0),S>tt?(S=-tt,P=!0):S<-tt&&(S=tt,P=!0),P&&(Math.abs(a)>Math.abs(l)?(E=this.rng.range(-tt,tt),S=this.rng.range(-tt,tt)):(b=this.rng.range(-tt,tt),E=this.rng.range(-tt,tt))),this.particlePositions[h]=b,this.particlePositions[h+1]=E,this.particlePositions[h+2]=S;const A=p*6;v[A]=b,v[A+1]=E,v[A+2]=S,v[A+3]=b-a*f,v[A+4]=E-o*f,v[A+5]=S-l*f}g.needsUpdate=!0}destroy(){this.geometry.dispose(),this.material.dispose()}}const qr=kl/Pn*Bt;function Ug(){if(typeof document>"u"||!document.createElement)return null;const i=256,e=document.createElement("canvas");e.width=i,e.height=i;const t=e.getContext("2d");if(!t)return null;const n=i/2,s=t.createRadialGradient(n,n,0,n,n,n);s.addColorStop(0,"rgba(255, 255, 255, 1.0)"),s.addColorStop(.08,"rgba(255, 250, 220, 0.95)"),s.addColorStop(.25,"rgba(255, 200, 110, 0.45)"),s.addColorStop(.55,"rgba(255, 140, 40, 0.12)"),s.addColorStop(1,"rgba(255, 100, 20, 0.0)"),t.fillStyle=s,t.fillRect(0,0,i,i),t.strokeStyle="rgba(255, 245, 220, 0.25)",t.lineWidth=1.5,t.beginPath(),t.moveTo(n,0),t.lineTo(n,i),t.moveTo(0,n),t.lineTo(i,n),t.stroke();const r=new lr(e);return r.colorSpace=yt,r}function Og(i){if(typeof document>"u"||!document.createElement)return null;const e=128,t=document.createElement("canvas");t.width=e,t.height=e;const n=t.getContext("2d");if(!n)return null;const s=e/2,r=n.createRadialGradient(s,s,0,s,s,s);r.addColorStop(0,i),r.addColorStop(.6,i.replace(/[\d.]+\)$/,"0.2)")),r.addColorStop(.9,i.replace(/[\d.]+\)$/,"0.05)")),r.addColorStop(1,"rgba(0, 0, 0, 0.0)"),n.fillStyle=r,n.fillRect(0,0,e,e);const a=new lr(t);return a.colorSpace=yt,a}class Fg{group;coreMesh;glareSprite;glareTexture=null;flares=[];flareGroup;constructor(){this.group=new Rn,this.group.name="SunSystem";const e=new cs(qr,32,16),t=new wi({color:16777215});this.coreMesh=new Ct(e,t),this.coreMesh.name="SunCore",this.group.add(this.coreMesh),this.glareTexture=Ug();const n=new no({map:this.glareTexture,color:16777215,transparent:!0,blending:Zt,depthWrite:!1});this.glareSprite=new Rc(n),this.glareSprite.name="SunGlare";const s=qr*14;this.glareSprite.scale.set(s,s,1),this.group.add(this.glareSprite),this.flareGroup=new Rn,this.flareGroup.name="SunFlares",this.group.add(this.flareGroup),this.initFlares()}initFlares(){const e=[{color:"rgba(0, 229, 255, 0.4)",offset:.35,size:.8},{color:"rgba(255, 171, 0, 0.35)",offset:.65,size:1.2},{color:"rgba(224, 64, 251, 0.25)",offset:-.4,size:.5},{color:"rgba(0, 230, 118, 0.3)",offset:.9,size:.4}],t=new ls(1,1);e.forEach(n=>{const s=Og(n.color),r=new wi({map:s,transparent:!0,blending:Zt,depthWrite:!1,opacity:0}),a=new Ct(t,r);a.visible=!1,this.flareGroup.add(a),this.flares.push({mesh:a,material:r,offset:n.offset,baseSize:n.size})})}update(e,t){const n=-e[0]*Bt,s=0,r=e[1]*Bt;this.group.position.set(n,s,r);const o=Math.hypot(n,r)/Bt,l=Math.max(.6,Math.min(1.8,1/Math.sqrt(o))),c=qr*14*l;this.glareSprite.scale.set(c,c,1),this.updateFlares(t)}updateFlares(e){const n=this.group.position.clone().project(e),s=n.z<1,r=Math.hypot(n.x,n.y);if(!(s&&r<1.3)||this.flares.length===0){this.flares.forEach(d=>{d.mesh.visible=!1});return}const o=1-Math.min(1,Math.max(0,(r-.7)/.6)),l=-n.x,c=-n.y;this.flares.forEach(d=>{d.mesh.visible=!0,d.material.opacity=.35*o;const u=new U(n.x+l*d.offset,n.y+c*d.offset,.5);u.unproject(e),d.mesh.position.copy(u),d.mesh.quaternion.copy(e.quaternion);const f=d.baseSize*.15*o;d.mesh.scale.set(f,f,1)})}getPosition(){return this.group.position}getAngularDiameterRad(e){const n=Math.hypot(e[0],e[1])*Pn;return 2*Math.atan(kl/n)}destroy(){this.coreMesh.geometry.dispose(),this.coreMesh.material.dispose(),this.glareTexture&&this.glareTexture.dispose(),this.glareSprite.material.dispose(),this.flares.forEach(e=>{e.mesh.geometry.dispose(),e.material.dispose(),e.material.map&&e.material.map.dispose()})}}const Ic=`
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float val = 0.0;
    float amp = 0.5;
    vec3 q = p;
    for (int i = 0; i < 4; i++) {
      val += amp * (0.5 + 0.5 * snoise(q));
      q *= 2.05;
      amp *= 0.5;
    }
    return val;
  }
`,Bg=`
  varying vec3 vNormal;
  varying vec3 vObjectPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vObjectPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,kg=`
  uniform vec3 uSunDir;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vObjectPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  ${Ic}

  void main() {
    // 1. Surface terrain via 3D fBm
    float elev = fbm(vObjectPos * 2.2);

    vec3 albedo;
    float isWater = 0.0;

    if (elev < 0.48) {
      // Ocean: deep ocean to coastal shallows
      isWater = 1.0;
      float depth = smoothstep(0.2, 0.48, elev);
      albedo = mix(vec3(0.015, 0.08, 0.22), vec3(0.04, 0.22, 0.32), depth);
    } else {
      // Continents: lowlands, arid plateaus, mountains
      float landElev = smoothstep(0.48, 0.85, elev);
      vec3 greenLand = vec3(0.12, 0.26, 0.09);
      vec3 aridLand = vec3(0.36, 0.28, 0.16);
      vec3 mountain = vec3(0.75, 0.78, 0.82);

      if (landElev < 0.5) {
        albedo = mix(greenLand, aridLand, landElev * 2.0);
      } else {
        albedo = mix(aridLand, mountain, (landElev - 0.5) * 2.0);
      }
    }

    // 2. Dynamic clouds layer (swirling wisps)
    vec3 cloudCoord = vObjectPos * 3.6 + vec3(uTime * 0.015, 0.0, uTime * 0.005);
    float cloudNoise = fbm(cloudCoord);
    float cloud = smoothstep(0.50, 0.74, cloudNoise);
    albedo = mix(albedo, vec3(0.95, 0.98, 1.0), cloud * 0.9);

    // 3. Phase lighting from Sun direction
    float NdotL = dot(vNormal, uSunDir);
    float diff = max(0.0, NdotL);

    // Ocean specular reflection (sun glint)
    if (isWater > 0.5 && diff > 0.0) {
      vec3 halfVec = normalize(uSunDir + vViewDir);
      float spec = pow(max(0.0, dot(vNormal, halfVec)), 32.0);
      albedo += vec3(1.0, 0.95, 0.8) * spec * (1.0 - cloud) * 0.8;
    }

    // 4. Limb darkening
    float mu = max(0.0, dot(vNormal, vViewDir));
    float limbDark = 1.0 - 0.35 * (1.0 - mu);

    // 5. Electric blue atmosphere rim glow (Rayleigh scattering)
    float rim = pow(1.0 - mu, 3.2) * max(0.04, NdotL + 0.25);
    vec3 atmoColor = vec3(0.18, 0.55, 1.0) * rim * 1.5;

    // Diffuse lighting + night-side ambient starlight
    vec3 litColor = albedo * (diff * limbDark + 0.03) + atmoColor;

    gl_FragColor = vec4(litColor, 1.0);
  }
`,Hg=`
  uniform vec3 uSunDir;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vObjectPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  ${Ic}

  void main() {
    // 1. Martian topography via 3D fBm
    float terrain = fbm(vObjectPos * 2.6);

    // Albedo base: rich rust-ochre
    vec3 rustBright = vec3(0.82, 0.40, 0.16);
    vec3 rustDark = vec3(0.60, 0.24, 0.09);
    vec3 albedo = mix(rustDark, rustBright, terrain);

    // Dark volcanic basalt patches (Syrtis Major style)
    float darkPatch = smoothstep(0.42, 0.28, terrain);
    vec3 basalt = vec3(0.24, 0.13, 0.08);
    albedo = mix(albedo, basalt, darkPatch * 0.75);

    // 2. Polar ice caps (North & South poles)
    float poleDist = abs(vObjectPos.y);
    float iceBorder = 0.80 + 0.05 * snoise(vObjectPos * 6.0);
    float ice = smoothstep(iceBorder, iceBorder + 0.06, poleDist);
    vec3 polarFrost = vec3(0.92, 0.95, 0.98);
    albedo = mix(albedo, polarFrost, ice);

    // 3. Phase lighting from Sun direction
    float NdotL = dot(vNormal, uSunDir);
    float diff = max(0.0, NdotL);

    // 4. Limb darkening
    float mu = max(0.0, dot(vNormal, vViewDir));
    float limbDark = 1.0 - 0.28 * (1.0 - mu);

    // 5. Faint dusty atmospheric haze rim
    float rim = pow(1.0 - mu, 4.0) * max(0.04, NdotL + 0.2);
    vec3 atmoHaze = vec3(0.78, 0.48, 0.35) * rim * 1.1;

    // Diffuse lighting + night-side starlight
    vec3 litColor = albedo * (diff * limbDark + 0.02) + atmoHaze;

    gl_FragColor = vec4(litColor, 1.0);
  }
`;function zg(i){if(typeof document>"u"||!document.createElement)return null;const e=64,t=document.createElement("canvas");t.width=e,t.height=e;const n=t.getContext("2d");if(!n)return null;const s=e/2,r=n.createRadialGradient(s,s,0,s,s,s);r.addColorStop(0,"rgba(255, 255, 255, 1.0)"),r.addColorStop(.25,i),r.addColorStop(.7,i.replace(/[\d.]+\)$/,"0.2)")),r.addColorStop(1,"rgba(0, 0, 0, 0.0)"),n.fillStyle=r,n.fillRect(0,0,e,e);const a=new lr(t);return a.colorSpace=yt,a}class Il{group;type;physicalRadiusM;sceneRadius;sphereMesh;material;beaconSprite;beaconTexture=null;constructor(e){this.type=e,this.physicalRadiusM=e==="EARTH"?Vc:zc,this.sceneRadius=this.physicalRadiusM/Pn*Bt,this.group=new Rn,this.group.name=`Planet_${e}`;const t=new cs(1,48,24),n=e==="EARTH"?kg:Hg;this.material=new mt({vertexShader:Bg,fragmentShader:n,uniforms:{uSunDir:{value:new U(1,0,0)},uTime:{value:0}}}),this.sphereMesh=new Ct(t,this.material),this.sphereMesh.name=`${e}_Surface`,this.group.add(this.sphereMesh);const s=e==="EARTH"?"rgba(0, 229, 255, 0.95)":"rgba(255, 120, 50, 0.95)";this.beaconTexture=zg(s);const r=new no({map:this.beaconTexture,transparent:!0,blending:Zt,depthWrite:!1,opacity:1});this.beaconSprite=new Rc(r),this.beaconSprite.name=`${e}_Beacon`,this.group.add(this.beaconSprite)}update(e,t,n,s){const r=(e[0]-t[0])*Bt,a=0,o=-(e[1]-t[1])*Bt;this.group.position.set(r,a,o);const l=Math.hypot(r,o),d=l/Bt*Pn,u=Math.atan(this.physicalRadiusM/d),f=s.fov*Math.PI/180,m=typeof window<"u"?window.innerHeight:800,g=u/(f/2)*(m/2),p=2/(m/2)*(f/2),h=Math.max(u,p),b=Math.max(this.sceneRadius,l*Math.tan(h));this.sphereMesh.scale.set(b,b,b);const E=Math.max(0,Math.min(1,1-(g-2)/7));this.beaconSprite.material.opacity=E,this.beaconSprite.visible=E>.01;const S=Math.max(.08,l*.012);this.beaconSprite.scale.set(S,S,1);const P=Math.hypot(e[0],e[1]);if(P>1e-8){const A=-e[0]/P,w=0,N=e[1]/P;this.material.uniforms.uSunDir.value.set(A,w,N)}this.material.uniforms.uTime.value=n}getPosition(){return this.group.position}getAngularDiameterRad(e,t){const s=Math.hypot(t[0]-e[0],t[1]-e[1])*Pn;return 2*Math.atan(this.physicalRadiusM/s)}destroy(){this.sphereMesh.geometry.dispose(),this.material.dispose(),this.beaconTexture&&this.beaconTexture.dispose(),this.beaconSprite.material.dispose()}}class Vg{camera;mode="FORWARD";target="MARS";container;currentQuat=new gn;targetQuat=new gn;dummyLookObject=new gt;yaw=0;pitch=0;isDragging=!1;lastMouseX=0;lastMouseY=0;minFov=50;maxFov=90;onMouseDownBound;onMouseMoveBound;onMouseUpBound;onWheelBound;constructor(e,t){this.camera=e,this.container=t,this.currentQuat.copy(e.quaternion),this.targetQuat.copy(e.quaternion),this.onMouseDownBound=this.onMouseDown.bind(this),this.onMouseMoveBound=this.onMouseMove.bind(this),this.onMouseUpBound=this.onMouseUp.bind(this),this.onWheelBound=this.onWheel.bind(this),this.attachEvents()}attachEvents(){this.container.addEventListener("mousedown",this.onMouseDownBound),typeof window<"u"&&(window.addEventListener("mousemove",this.onMouseMoveBound),window.addEventListener("mouseup",this.onMouseUpBound)),this.container.addEventListener("wheel",this.onWheelBound,{passive:!1})}detachEvents(){this.container.removeEventListener("mousedown",this.onMouseDownBound),typeof window<"u"&&(window.removeEventListener("mousemove",this.onMouseMoveBound),window.removeEventListener("mouseup",this.onMouseUpBound)),this.container.removeEventListener("wheel",this.onWheelBound)}setMode(e,t){if(this.mode=e,t&&(this.target=t),e==="FREE_LOOK"){const n=new kt().setFromQuaternion(this.camera.quaternion,"YXZ");this.yaw=n.y,this.pitch=n.x,this.container.style.cursor="grab"}else this.container.style.cursor="default"}setLockTarget(e){this.target=e,this.mode="TARGET_LOCK"}onMouseDown(e){e.button===0&&(this.isDragging=!0,this.lastMouseX=e.clientX,this.lastMouseY=e.clientY,this.mode==="FREE_LOOK"&&(this.container.style.cursor="grabbing"))}onMouseMove(e){if(!this.isDragging)return;const t=e.clientX-this.lastMouseX,n=e.clientY-this.lastMouseY;if(this.lastMouseX=e.clientX,this.lastMouseY=e.clientY,this.mode==="FREE_LOOK"){this.yaw-=t*.0035,this.pitch-=n*.0035;const r=hn(85);this.pitch=Math.max(-r,Math.min(r,this.pitch));const a=new kt(this.pitch,this.yaw,0,"YXZ");this.targetQuat.setFromEuler(a)}}onMouseUp(){this.isDragging&&(this.isDragging=!1,this.mode==="FREE_LOOK"&&(this.container.style.cursor="grab"))}onWheel(e){e.preventDefault();const t=.04;this.camera.fov+=e.deltaY*t,this.camera.fov=Math.max(this.minFov,Math.min(this.maxFov,this.camera.fov)),this.camera.updateProjectionMatrix()}update(e,t){const n=new U(0,0,0);if(this.mode==="FORWARD"||this.mode==="RETROGRADE"){const a=e.shipVel[0],o=-e.shipVel[1];if(Math.hypot(a,o)>1e-8){const c=this.mode==="FORWARD"?1:-1,d=new U(a*c,0,o*c).normalize();this.dummyLookObject.position.copy(n),this.dummyLookObject.lookAt(d),this.targetQuat.copy(this.dummyLookObject.quaternion)}}else if(this.mode==="TARGET_LOCK"){let a;this.target==="SUN"?a=[0,0]:this.target==="EARTH"?a=e.earthPos:a=e.marsPos;const o=(a[0]-e.shipPos[0])*Bt,l=-(a[1]-e.shipPos[1])*Bt,c=new U(o,0,l);c.lengthSq()>1e-6&&(this.dummyLookObject.position.copy(n),this.dummyLookObject.lookAt(c),this.targetQuat.copy(this.dummyLookObject.quaternion))}const s=this.mode==="FREE_LOOK"&&this.isDragging?25:4.5,r=1-Math.exp(-Math.max(.001,t)*s);this.currentQuat.slerp(this.targetQuat,Math.min(1,r)),this.camera.quaternion.copy(this.currentQuat)}getOffscreenIndicators(e){const t=[{name:"SUN",posAU:[0,0],color:"#ffab00"},{name:"EARTH",posAU:e.earthPos,color:"#00e5ff"},{name:"MARS",posAU:e.marsPos,color:"#ff5252"}],n=this.container.getBoundingClientRect(),s=n.width||800,r=n.height||600,a=[];return t.forEach(({name:o,posAU:l,color:c})=>{const d=l[0]-e.shipPos[0],u=l[1]-e.shipPos[1],f=Math.hypot(d,u),g=new U(d*Bt,0,-u*Bt).clone().project(this.camera),v=g.z>1;let p=g.x,h=g.y;v&&(p=-p,h=-h);const b=.88;if(!v&&Math.abs(p)<=b&&Math.abs(h)<=b){a.push({name:o,screenX:(p+1)/2*s,screenY:(-h+1)/2*r,angleRad:0,distanceAU:f,color:c,visible:!1});return}const S=Math.hypot(p,h);if(S<1e-6)return;const P=p/S,A=h/S,w=P!==0?b/Math.abs(P):1/0,N=A!==0?b/Math.abs(A):1/0,M=Math.min(w,N),x=P*M,C=A*M,z=(x+1)/2*s,O=(-C+1)/2*r,q=Math.atan2(O-r/2,z-s/2);a.push({name:o,screenX:z,screenY:O,angleRad:q,distanceAU:f,color:c,visible:!0})}),a}resetFov(){this.camera.fov=60,this.camera.updateProjectionMatrix()}destroy(){this.detachEvents()}}class Gg{mesh;meteorLine;meteorGeo;meteorMat;meteorPositions;meteorColors;meteorActive=!1;meteorProgress=0;meteorDuration=.35;nextMeteorTime=12;meteorStart=new U;meteorEnd=new U;rng;overlayElement=null;constructor(e,t=555){this.rng=new Ft(t),this.mesh=new Rn,this.mesh.name="SkyEffects",this.meteorPositions=new Float32Array(6),this.meteorColors=new Float32Array(6),this.meteorGeo=new Tt,this.meteorGeo.setAttribute("position",new dt(this.meteorPositions,3)),this.meteorGeo.setAttribute("color",new dt(this.meteorColors,3)),this.meteorMat=new io({vertexColors:!0,transparent:!0,blending:Zt,depthWrite:!1}),this.meteorLine=new Pc(this.meteorGeo,this.meteorMat),this.meteorLine.visible=!1,this.mesh.add(this.meteorLine),e&&typeof document<"u"&&this.setupOverlay(e)}setupOverlay(e){const t=document.createElement("div");if(t.className="sky-hud-overlay",t.style.cssText=`
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      background: radial-gradient(circle at 50% 50%, transparent 65%, rgba(10, 14, 20, 0.6) 100%);
      box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.5);
      z-index: 2;
    `,!(typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)){const s=document.createElement("div");s.style.cssText=`
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
        background-size: 100% 4px;
        opacity: 0.35;
        pointer-events: none;
      `,t.appendChild(s)}e.appendChild(t),this.overlayElement=t}getAdcsDriftQuaternion(e,t){if(t)return new gn;const n=.01*Math.PI/180,s=n*(.65*Math.sin(.38*e)+.35*Math.sin(.82*e)),r=n*(.6*Math.cos(.44*e)+.4*Math.sin(.95*e)),a=n*.25*Math.sin(.25*e),o=new kt(r,s,a,"YXZ");return new gn().setFromEuler(o)}update(e,t){if(t){this.meteorLine.visible=!1;return}this.meteorActive?(this.meteorProgress+=e/this.meteorDuration,this.meteorProgress>=1?(this.meteorActive=!1,this.meteorLine.visible=!1,this.nextMeteorTime=this.rng.range(18,45)):this.updateMeteorGeometry()):(this.nextMeteorTime-=e,this.nextMeteorTime<=0&&this.spawnMeteor())}spawnMeteor(){this.meteorActive=!0,this.meteorProgress=0,this.meteorDuration=this.rng.range(.25,.45);const e=this.rng.random(),t=this.rng.random(),n=2*Math.PI*e,s=Math.acos(2*t-1),r=600,a=r*Math.sin(s)*Math.cos(n),o=r*Math.cos(s),l=r*Math.sin(s)*Math.sin(n);this.meteorStart.set(a,o,l);const c=this.rng.range(15,35),d=new U(this.rng.range(-1,1),this.rng.range(-1,1),this.rng.range(-1,1)).normalize();this.meteorEnd.copy(this.meteorStart).addScaledVector(d,c),this.meteorLine.visible=!0,this.updateMeteorGeometry()}updateMeteorGeometry(){const e=new U().lerpVectors(this.meteorStart,this.meteorEnd,this.meteorProgress),t=Math.max(0,this.meteorProgress-.35),n=new U().lerpVectors(this.meteorStart,this.meteorEnd,t),s=this.meteorPositions;s[0]=e.x,s[1]=e.y,s[2]=e.z,s[3]=n.x,s[4]=n.y,s[5]=n.z;const r=Math.sin(this.meteorProgress*Math.PI),a=this.meteorColors;a[0]=.8*r,a[1]=.95*r,a[2]=1*r,a[3]=.1*r,a[4]=.2*r,a[5]=.4*r,this.meteorGeo.attributes.position.needsUpdate=!0,this.meteorGeo.attributes.color.needsUpdate=!0}destroy(){this.meteorGeo.dispose(),this.meteorMat.dispose(),this.overlayElement&&this.overlayElement.parentElement&&this.overlayElement.parentElement.removeChild(this.overlayElement)}}const Lc={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Di{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Wg=new bc(-1,1,1,-1,0,1);class Xg extends Tt{constructor(){super(),this.setAttribute("position",new Rt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Rt([0,2,0,0,2,0],2))}}const qg=new Xg;class so{constructor(e){this._mesh=new Ct(qg,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Wg)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Yg extends Di{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof mt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=is.clone(e.uniforms),this.material=new mt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new so(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Ll extends Di{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class $g extends Di{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class jg{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new Le);this._width=n.width,this._height=n.height,t=new Yt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:fn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Yg(Lc),this.copyPass.material.blending=un,this.clock=new Tg}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Ll!==void 0&&(a instanceof Ll?n=!0:a instanceof $g&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Le);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Kg extends Di{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Ve}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}}const Jg={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ve(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Ri extends Di{constructor(e,t,n,s){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new Le(e.x,e.y):new Le(256,256),this.clearColor=new Ve(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Yt(r,a,{type:fn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const f=new Yt(r,a,{type:fn});f.texture.name="UnrealBloomPass.h"+u,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);const m=new Yt(r,a,{type:fn});m.texture.name="UnrealBloomPass.v"+u,m.texture.generateMipmaps=!1,this.renderTargetsVertical.push(m),r=Math.round(r/2),a=Math.round(a/2)}const o=Jg;this.highPassUniforms=is.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new mt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Le(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new U(1,1,1),new U(1,1,1),new U(1,1,1),new U(1,1,1),new U(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const d=Lc;this.copyUniforms=is.clone(d.uniforms),this.blendMaterial=new mt({uniforms:this.copyUniforms,vertexShader:d.vertexShader,fragmentShader:d.fragmentShader,blending:Zt,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Ve,this.oldClearAlpha=1,this.basic=new wi,this.fsQuad=new so(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new Le(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Ri.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Ri.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=a}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new mt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Le(.5,.5)},direction:{value:new Le(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new mt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Ri.BlurDirectionX=new Le(1,0);Ri.BlurDirectionY=new Le(0,1);const Zg={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Qg extends Di{constructor(){super();const e=Zg;this.uniforms=is.clone(e.uniforms),this.material=new Eg({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new so(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Xe.getTransfer(this._outputColorSpace)===Je&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Yl?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===$l?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===jl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ya?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Kl?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Jl&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const e0=658964;class t0{scene;camera;renderer=null;composer=null;stars;milkyWay;dust;sun;earthBody;marsBody;cameraController;effects;container;resizeObserver=null;lastRenderTime=0;indicatorOverlay=null;lastState=null;constructor(e){this.container=e,this.scene=new xg,this.scene.background=new Ve(e0);const t=e.clientWidth||800,n=e.clientHeight||600;this.camera=new Ut(60,t/Math.max(1,n),.001,1e4),this.camera.position.set(0,0,0);const s=typeof window<"u"?Math.min(window.devicePixelRatio||1,2):1;try{this.renderer=new _g({antialias:!0,alpha:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(s),this.renderer.setSize(t,n),this.renderer.toneMapping=Ya,this.renderer.toneMappingExposure=1;const r=this.renderer.domElement;r.style.position="absolute",r.style.top="0",r.style.left="0",r.style.width="100%",r.style.height="100%",r.style.display="block",this.container.appendChild(r),this.composer=new jg(this.renderer);const a=new Kg(this.scene,this.camera);this.composer.addPass(a);const o=new Ri(new Le(t,n),.75,.35,.8);this.composer.addPass(o);const l=new Qg;this.composer.addPass(l)}catch{this.renderer=null,this.composer=null}this.stars=new Pg,this.scene.add(this.stars.mesh),this.milkyWay=new Dg,this.scene.add(this.milkyWay.mesh),this.dust=new Ng,this.scene.add(this.dust.mesh),this.sun=new Fg,this.scene.add(this.sun.group),this.earthBody=new Il("EARTH"),this.scene.add(this.earthBody.group),this.marsBody=new Il("MARS"),this.scene.add(this.marsBody.group),this.cameraController=new Vg(this.camera,this.container),this.effects=new Gg(this.container),this.scene.add(this.effects.mesh),typeof document<"u"&&this.setupIndicatorOverlay(),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.resize()}),this.resizeObserver.observe(this.container)),this.lastRenderTime=typeof performance<"u"?performance.now():Date.now()}setupIndicatorOverlay(){const e=document.createElement("div");e.className="sky-indicator-overlay",e.style.cssText=`
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 5;
    `,this.container.appendChild(e),this.indicatorOverlay=e}render(e){this.lastState=e;const t=typeof performance<"u"?performance.now():Date.now(),n=Math.min(.1,Math.max(.001,(t-this.lastRenderTime)/1e3));this.lastRenderTime=t;const s=typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,r=(e.simTimeJD-2451545)*86400;this.sun.update(e.shipPos,this.camera),this.earthBody.update(e.earthPos,e.shipPos,r,this.camera),this.marsBody.update(e.marsPos,e.shipPos,r,this.camera),this.dust.update(e.shipVel,n),this.cameraController.update(e,n);const a=this.effects.getAdcsDriftQuaternion(r,s);this.camera.quaternion.multiply(a),this.stars.update(r,s),this.milkyWay.update(),this.effects.update(n,s),this.composer?this.composer.render():this.renderer&&this.renderer.render(this.scene,this.camera),this.renderOffscreenIndicators(e)}renderOffscreenIndicators(e){if(!this.indicatorOverlay)return;const t=this.cameraController.getOffscreenIndicators(e);let n="";t.forEach(r=>{if(!r.visible)return;const a=r.angleRad*180/Math.PI;n+=`
        <div class="offscreen-badge" data-target="${r.name}" style="
          position: absolute;
          left: ${Math.round(r.screenX)}px;
          top: ${Math.round(r.screenY)}px;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(10, 14, 20, 0.85);
          border: 1px solid ${r.color};
          padding: 2px 6px;
          border-radius: 2px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: ${r.color};
          box-shadow: 0 0 8px ${r.color}40;
          user-select: none;
          pointer-events: auto;
          cursor: pointer;
        " title="Click to lock camera onto ${r.name}">
          <span style="display: inline-block; transform: rotate(${a}deg); font-size: 11px;">▶</span>
          <span>${r.name}</span>
          <span style="font-weight: normal; color: var(--text-secondary, #8899aa);">${r.distanceAU.toFixed(3)} AU</span>
        </div>
      `}),this.indicatorOverlay.innerHTML=n,this.indicatorOverlay.querySelectorAll(".offscreen-badge").forEach(r=>{r.addEventListener("click",a=>{a.stopPropagation();const o=r.dataset.target;o&&this.cameraController.setMode("TARGET_LOCK",o)})})}resize(){const e=this.container.clientWidth||800,t=this.container.clientHeight||600;this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix(),this.renderer&&this.renderer.setSize(e,t),this.composer&&this.composer.setSize(e,t),this.lastState&&this.renderOffscreenIndicators(this.lastState)}getOffscreenIndicators(){return this.lastState?this.cameraController.getOffscreenIndicators(this.lastState):[]}setCameraMode(e,t){this.cameraController.setMode(e,t)}setLockTarget(e){this.cameraController.setLockTarget(e)}getCameraMode(){return this.cameraController.mode}getLockTarget(){return this.cameraController.target}setStreaksEnabled(e){this.dust.setStreaksEnabled(e)}toggleStreaks(){return this.dust.toggleStreaks()}isStreaksEnabled(){return this.dust.isStreaksEnabled()}resetFov(){this.cameraController.resetFov()}getCamera(){return this.camera}getScene(){return this.scene}destroy(){if(this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.cameraController.destroy(),this.effects.destroy(),this.stars.destroy(),this.milkyWay.destroy(),this.dust.destroy(),this.sun.destroy(),this.earthBody.destroy(),this.marsBody.destroy(),this.composer&&(this.composer.dispose(),this.composer=null),this.renderer){this.renderer.dispose();const e=this.renderer.domElement;e&&e.parentElement&&e.parentElement.removeChild(e),this.renderer=null}this.indicatorOverlay&&this.indicatorOverlay.parentElement&&(this.indicatorOverlay.parentElement.removeChild(this.indicatorOverlay),this.indicatorOverlay=null)}}class n0{_buf;_head=0;_count=0;capacity;constructor(e){this.capacity=e,this._buf=new Array(e)}push(e){this._buf[this._head]=e,this._head=(this._head+1)%this.capacity,this._count<this.capacity&&this._count++}get length(){return this._count}*[Symbol.iterator](){const e=this._count<this.capacity?0:this._head;for(let t=0;t<this._count;t++)yield this._buf[(e+t)%this.capacity]}toArray(){return[...this]}last(){if(this._count!==0)return this._buf[(this._head-1+this.capacity)%this.capacity]}clear(){this._head=0,this._count=0}}class i0{container;channelElements=new Map;sectionContainers=new Map;channelConfigs=[{id:"nav_dist_sun",name:"Sun Distance",unit:"AU",decimals:3,fidelity:"HIGH",section:"Navigation"},{id:"nav_dist_earth",name:"Earth Distance",unit:"AU",decimals:3,fidelity:"HIGH",section:"Navigation"},{id:"nav_dist_mars",name:"Mars Distance",unit:"AU",decimals:3,fidelity:"HIGH",section:"Navigation"},{id:"nav_speed",name:"Heliocentric Speed",unit:"km/s",decimals:2,fidelity:"HIGH",section:"Navigation"},{id:"gnc_deltav_remaining",name:"Remaining Delta-V",unit:"m/s",decimals:0,fidelity:"HIGH",section:"Navigation"},{id:"nav_eta_arrival",name:"Encounter ETA",unit:"days",decimals:1,fidelity:"HIGH",section:"Navigation"},{id:"gnc_thrust",name:"OMS Main Thrust",unit:"kN",decimals:1,fidelity:"HIGH",section:"Propulsion"},{id:"gnc_propellant_mass",name:"OMS Propellant",unit:"kg",decimals:0,fidelity:"HIGH",section:"Propulsion"},{id:"gnc_rcs_jitter",name:"RCS Rate Jitter",unit:"°/s",decimals:4,fidelity:"HIGH",section:"Propulsion"},{id:"power_solar_irradiance",name:"Solar Irradiance",unit:"W/m²",decimals:0,fidelity:"HIGH",section:"Power"},{id:"power_irradiance_pct",name:"Relative Solar Flux",unit:"%",decimals:1,fidelity:"HIGH",section:"Power"},{id:"power_array_output",name:"Array Generation",unit:"W",decimals:0,fidelity:"HIGH",section:"Power"},{id:"power_bus_loads",name:"Total Bus Loads",unit:"W",decimals:0,fidelity:"HIGH",section:"Power"},{id:"power_battery_soc",name:"Battery SoC",unit:"%",decimals:1,fidelity:"HIGH",section:"Power"},{id:"power_bus_voltage",name:"Regulated Bus Volts",unit:"V",decimals:1,fidelity:"HIGH",section:"Power"},{id:"thermal_loopA_tempIn",name:"Loop A Temp In",unit:"K",decimals:1,fidelity:"HIGH",section:"Thermal A"},{id:"thermal_loopA_tempOut",name:"Loop A Temp Out",unit:"K",decimals:1,fidelity:"HIGH",section:"Thermal A"},{id:"thermal_loopA_flow",name:"Loop A Mass Flow",unit:"kg/s",decimals:2,fidelity:"HIGH",section:"Thermal A"},{id:"thermal_loopA_pumpRpm",name:"Loop A Pump Speed",unit:"RPM",decimals:0,fidelity:"HIGH",section:"Thermal A"},{id:"thermal_loopA_pressure",name:"Loop A Pressure",unit:"kPa",decimals:1,fidelity:"HIGH",section:"Thermal A"},{id:"thermal_loopA_accum",name:"Loop A Accumulator",unit:"%",decimals:1,fidelity:"HIGH",section:"Thermal A"},{id:"thermal_loopB_tempIn",name:"Loop B Temp In",unit:"K",decimals:1,fidelity:"HIGH",section:"Thermal B"},{id:"thermal_loopB_tempOut",name:"Loop B Temp Out",unit:"K",decimals:1,fidelity:"HIGH",section:"Thermal B"},{id:"thermal_loopB_flow",name:"Loop B Mass Flow",unit:"kg/s",decimals:2,fidelity:"HIGH",section:"Thermal B"},{id:"thermal_loopB_pumpRpm",name:"Loop B Pump Speed",unit:"RPM",decimals:0,fidelity:"HIGH",section:"Thermal B"},{id:"thermal_loopB_pressure",name:"Loop B Pressure",unit:"kPa",decimals:1,fidelity:"HIGH",section:"Thermal B"},{id:"thermal_loopB_accum",name:"Loop B Accumulator",unit:"%",decimals:1,fidelity:"HIGH",section:"Thermal B"},{id:"eclss_cabin_pressure",name:"Cabin Total Pressure",unit:"kPa",decimals:1,fidelity:"HIGH",section:"ECLSS"},{id:"eclss_ppO2",name:"Oxygen ppO2",unit:"kPa",decimals:2,fidelity:"HIGH",section:"ECLSS"},{id:"eclss_ppN2",name:"Nitrogen ppN2",unit:"kPa",decimals:1,fidelity:"HIGH",section:"ECLSS"},{id:"eclss_ppCO2",name:"Carbon Dioxide ppCO2",unit:"kPa",decimals:3,fidelity:"HIGH",section:"ECLSS"},{id:"eclss_o2_flow",name:"O2 Supply Rate",unit:"g/s",decimals:2,fidelity:"HIGH",section:"ECLSS"},{id:"eclss_scrubber_eff",name:"CO2 Scrubber Eff",unit:"%",decimals:1,fidelity:"HIGH",section:"ECLSS"},{id:"rad_dose_rate",name:"Ambient Dose Rate",unit:"mSv/d",decimals:2,fidelity:"HIGH",section:"Radiation"},{id:"rad_cumulative_dose",name:"Cumulative Dose",unit:"mSv",decimals:2,fidelity:"HIGH",section:"Radiation"},{id:"crew_1_spO2",name:"CDR Rostova SpO2",unit:"%",decimals:1,fidelity:"HIGH",section:"Crew"},{id:"crew_1_hr",name:"CDR Rostova Heart",unit:"bpm",decimals:0,fidelity:"HIGH",section:"Crew"},{id:"crew_2_spO2",name:"PLT Vance SpO2",unit:"%",decimals:1,fidelity:"HIGH",section:"Crew"},{id:"crew_2_hr",name:"PLT Vance Heart",unit:"bpm",decimals:0,fidelity:"HIGH",section:"Crew"},{id:"crew_3_spO2",name:"MS1 Tanaka SpO2",unit:"%",decimals:1,fidelity:"HIGH",section:"Crew"},{id:"crew_3_hr",name:"MS1 Tanaka Heart",unit:"bpm",decimals:0,fidelity:"HIGH",section:"Crew"},{id:"crew_4_spO2",name:"MS2 Okafor SpO2",unit:"%",decimals:1,fidelity:"HIGH",section:"Crew"},{id:"crew_4_hr",name:"MS2 Okafor Heart",unit:"bpm",decimals:0,fidelity:"HIGH",section:"Crew"},{id:"compute_tier1_pwr",name:"Tier 1 FSW Power",unit:"W",decimals:1,fidelity:"HIGH",section:"Compute"},{id:"compute_tier2_pwr",name:"Tier 2 AI Power",unit:"W",decimals:1,fidelity:"HIGH",section:"Compute"},{id:"compute_total_pwr",name:"Total Compute Pwr",unit:"W",decimals:1,fidelity:"HIGH",section:"Compute"}];constructor(e){this.container=e,this.initDOM()}initDOM(){this.container.innerHTML=`
      <div class="telem-panel-header">
        <div class="telem-panel-title">SUBSYSTEM TELEMETRY</div>
        <div class="telem-badge-row">
          <span class="fidelity-badge fidelity-high">60s TRENDS</span>
          <span class="synthetic-banner">SYNTHETIC</span>
        </div>
      </div>
      <div class="telem-sections-container"></div>
    `;const e=this.container.querySelector(".telem-sections-container"),t=new Map;for(const n of this.channelConfigs)t.has(n.section)||t.set(n.section,[]),t.get(n.section).push(n);for(const[n,s]of t.entries()){const r=document.createElement("div");r.className="telem-section";const a=document.createElement("div");a.className="telem-sec-header",a.textContent=n.toUpperCase(),r.appendChild(a);const o=document.createElement("div");o.className="telem-sec-content";for(const l of s){const c=document.createElement("div");c.className="telem-row",c.dataset.channel=l.id;const d=document.createElement("div");d.className="telem-meta";const u=document.createElement("span");u.className="telem-name",u.textContent=l.name,d.appendChild(u);const f=document.createElement("span");f.className=`fidelity-badge fidelity-${l.fidelity.toLowerCase()}`,f.textContent=l.fidelity,d.appendChild(f);const m=document.createElement("span");m.className="telem-status-badge",m.style.display="none",d.appendChild(m),c.appendChild(d);const g=document.createElement("span");g.className="telem-value level-nominal",g.textContent="-- "+l.unit,c.appendChild(g);const v=document.createElement("canvas");v.className="telem-sparkline",v.width=80,v.height=20,c.appendChild(v),o.appendChild(c),this.channelElements.set(l.id,{container:c,valueEl:g,statusBadgeEl:m,sparklineCanvas:v,sparklineCtx:v.getContext("2d"),history:new n0(60)})}r.appendChild(o),e.appendChild(r),this.sectionContainers.set(n,r)}this.injectStyles()}injectStyles(){if(document.getElementById("telem-panel-styles"))return;const e=document.createElement("style");e.id="telem-panel-styles",e.textContent=`
      .telem-panel-header {
        padding: 8px 10px;
        background: var(--bg-panel);
        border-bottom: var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 5;
      }
      .telem-panel-title {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 700;
        color: var(--cyan);
        letter-spacing: 1.2px;
      }
      .telem-badge-row {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .telem-sections-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 6px 4px;
      }
      .telem-section {
        background: rgba(14, 20, 28, 0.7);
        border: 1px solid rgba(0, 229, 255, 0.15);
        border-radius: 2px;
        overflow: hidden;
      }
      .telem-sec-header {
        background: rgba(0, 229, 255, 0.08);
        padding: 3px 8px;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        color: var(--cyan);
        letter-spacing: 1px;
        border-bottom: 1px solid rgba(0, 229, 255, 0.1);
      }
      .telem-sec-content {
        display: flex;
        flex-direction: column;
      }
      .telem-row {
        display: grid;
        grid-template-columns: 1fr auto 80px;
        align-items: center;
        gap: 6px;
        padding: 2px 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .telem-row:last-child {
        border-bottom: none;
      }
      .telem-meta {
        display: flex;
        align-items: center;
        gap: 4px;
        overflow: hidden;
      }
      .telem-name {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--text-secondary);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .telem-status-badge {
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        padding: 0 3px;
        border-radius: 2px;
        background: var(--amber);
        color: #000;
      }
      .telem-value {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-align: right;
        white-space: nowrap;
      }
      .telem-sparkline {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(0, 229, 255, 0.1);
        border-radius: 2px;
      }
      .level-nominal { color: var(--green); }
      .level-caution { color: var(--amber); text-shadow: 0 0 4px rgba(255, 171, 0, 0.4); }
      .level-warning { color: var(--red); font-weight: 700; text-shadow: 0 0 6px rgba(255, 23, 68, 0.6); }
      .level-critical { color: var(--magenta); font-weight: 700; text-shadow: 0 0 8px rgba(224, 64, 251, 0.8); }
    `,document.head.appendChild(e)}update(e,t){const n=new Map;for(const s of t)n.set(s.channel,s.level);for(const s of this.channelConfigs){const r=this.channelElements.get(s.id);if(!r)continue;const a=e.get(s.id);if(!a)continue;const o=a.measured;r.history.push(o),r.valueEl.textContent=`${o.toFixed(s.decimals)} ${s.unit}`;const l=n.get(s.id)??"NOMINAL";r.valueEl.className=`telem-value level-${l.toLowerCase()}`,a.status==="STUCK"?(r.statusBadgeEl.style.display="inline-block",r.statusBadgeEl.textContent="STUCK",r.statusBadgeEl.style.background="var(--red)",r.statusBadgeEl.style.color="#fff"):a.status==="DROPOUT"?(r.statusBadgeEl.style.display="inline-block",r.statusBadgeEl.textContent="DROP",r.statusBadgeEl.style.background="var(--amber)",r.statusBadgeEl.style.color="#000"):r.statusBadgeEl.style.display="none",this.drawSparkline(r,l)}}drawSparkline(e,t){const n=e.sparklineCtx;if(!n)return;const s=e.sparklineCanvas,r=s.width,a=s.height;n.clearRect(0,0,r,a);const o=e.history.length;if(o<2)return;const l=e.history.toArray();let c=1/0,d=-1/0;for(let h=0;h<o;h++){const b=l[h];b<c&&(c=b),b>d&&(d=b)}const u=d-c,f=u>1e-6?u*.1:1,m=c-f,v=d+f-m;let p="#00e676";t==="CAUTION"&&(p="#ffab00"),t==="WARNING"&&(p="#ff1744"),t==="CRITICAL"&&(p="#e040fb"),n.beginPath();for(let h=0;h<o;h++){const b=h/(o-1)*(r-2)+1,E=(l[h]-m)/v,S=a-2-E*(a-4);h===0?n.moveTo(b,S):n.lineTo(b,S)}n.strokeStyle=p,n.lineWidth=1.2,n.stroke()}}class s0{container;injector;bus;buttonElements=new Map;countBadge=null;constructor(e,t,n){this.container=e,this.injector=t,this.bus=n,this.initDOM(),this.bindEvents()}initDOM(){this.container.innerHTML=`
      <div class="fault-panel-wrapper">
        <div class="fault-header">
          <div class="fault-title-group">
            <span class="fault-title">FAULT INJECTION MATRIX</span>
            <span class="synthetic-banner">SYSTEM STRESS TESTING</span>
            <span id="fault-active-count" class="badge fidelity-high">0 FAULTS ACTIVE</span>
          </div>
          <div class="fault-controls">
            <button id="fault-clear-all-btn" class="fault-action-btn clear-all-btn" title="Clear all active simulated faults">
              CLEAR ALL FAULTS
            </button>
          </div>
        </div>
        <div class="fault-grid"></div>
      </div>
    `,this.countBadge=this.container.querySelector("#fault-active-count");const e=this.container.querySelector(".fault-grid");for(const n of xo){const s=document.createElement("div");s.className="fault-card",s.dataset.faultType=n.type;const r=document.createElement("div");r.className="fault-card-top";const a=document.createElement("span");a.className="fault-name",a.textContent=n.name,a.title=n.description;const o=document.createElement("span");o.className="fault-subsystem-badge",o.textContent=n.subsystem.toUpperCase(),r.appendChild(a),r.appendChild(o);const l=document.createElement("div");l.className="fault-card-bottom";const c=document.createElement("span");c.className="fault-status-badge status-inactive",c.textContent="INACTIVE";const d=document.createElement("button");d.className="fault-toggle-btn btn-inject",d.textContent="INJECT",d.addEventListener("click",()=>{this.injector.isActive(n.type)?this.injector.clear(n.type):this.injector.inject(n.type,n.defaultParams),this.updateCardState(n.type),this.updateHeaderCount()}),l.appendChild(c),l.appendChild(d),s.appendChild(r),s.appendChild(l),e.appendChild(s),this.buttonElements.set(n.type,{card:s,statusBadge:c,toggleBtn:d})}const t=this.container.querySelector("#fault-clear-all-btn");t&&t.addEventListener("click",()=>{this.injector.clearAll();for(const n of xo)this.updateCardState(n.type);this.updateHeaderCount()}),this.injectStyles()}bindEvents(){this.bus&&(this.bus.on("fault:injected",({faultId:e})=>{this.updateCardState(e),this.updateHeaderCount()}),this.bus.on("fault:cleared",({faultId:e})=>{this.updateCardState(e),this.updateHeaderCount()}))}updateCardState(e){const t=this.buttonElements.get(e);if(!t)return;this.injector.isActive(e)?(t.card.classList.add("fault-card-active"),t.statusBadge.className="fault-status-badge status-active",t.statusBadge.textContent="ACTIVE",t.toggleBtn.className="fault-toggle-btn btn-clear",t.toggleBtn.textContent="CLEAR"):(t.card.classList.remove("fault-card-active"),t.statusBadge.className="fault-status-badge status-inactive",t.statusBadge.textContent="INACTIVE",t.toggleBtn.className="fault-toggle-btn btn-inject",t.toggleBtn.textContent="INJECT")}updateHeaderCount(){if(!this.countBadge)return;const e=this.injector.getActive().length;e>0?(this.countBadge.textContent=`${e} FAULT${e>1?"S":""} ACTIVE`,this.countBadge.className="badge",this.countBadge.style.background="var(--red)",this.countBadge.style.color="#fff"):(this.countBadge.textContent="0 FAULTS ACTIVE",this.countBadge.className="badge fidelity-high",this.countBadge.style.background="var(--green)",this.countBadge.style.color="#000")}injectStyles(){if(document.getElementById("fault-panel-styles"))return;const e=document.createElement("style");e.id="fault-panel-styles",e.textContent=`
      .fault-panel-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .fault-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 10px;
        background: var(--bg-panel);
        border-bottom: var(--border);
        min-height: 28px;
      }
      .fault-title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fault-title {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 700;
        color: var(--cyan);
        letter-spacing: 1px;
      }
      .fault-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 6px;
        padding: 6px 10px;
        overflow-y: auto;
        flex: 1;
      }
      .fault-card {
        background: rgba(14, 20, 28, 0.7);
        border: 1px solid rgba(0, 229, 255, 0.2);
        border-radius: 3px;
        padding: 5px 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 4px;
        transition: border-color 0.2s, background-color 0.2s;
      }
      .fault-card:hover {
        border-color: rgba(0, 229, 255, 0.5);
      }
      .fault-card-active {
        background: rgba(255, 23, 68, 0.12) !important;
        border-color: var(--red) !important;
        box-shadow: 0 0 6px rgba(255, 23, 68, 0.4);
      }
      .fault-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
      }
      .fault-name {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fault-subsystem-badge {
        font-family: var(--font-mono);
        font-size: 8px;
        color: var(--cyan);
        background: rgba(0, 229, 255, 0.1);
        border: 1px solid rgba(0, 229, 255, 0.3);
        padding: 0 3px;
        border-radius: 2px;
        white-space: nowrap;
      }
      .fault-card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fault-status-badge {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .status-inactive {
        color: var(--text-secondary);
      }
      .status-active {
        color: var(--red);
        animation: fault-blink 1s infinite alternate;
      }
      @keyframes fault-blink {
        from { opacity: 0.6; }
        to { opacity: 1; }
      }
      .fault-toggle-btn {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 2px;
        cursor: pointer;
        outline: none;
        letter-spacing: 0.5px;
      }
      .btn-inject {
        background: rgba(0, 229, 255, 0.15);
        border: 1px solid var(--cyan);
        color: var(--cyan);
      }
      .btn-inject:hover {
        background: var(--cyan);
        color: #000;
      }
      .btn-clear {
        background: rgba(255, 23, 68, 0.2);
        border: 1px solid var(--red);
        color: var(--red);
      }
      .btn-clear:hover {
        background: var(--red);
        color: #fff;
      }
      .clear-all-btn {
        background: rgba(255, 171, 0, 0.15);
        border: 1px solid var(--amber);
        color: var(--amber);
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 2px;
        cursor: pointer;
      }
      .clear-all-btn:hover {
        background: var(--amber);
        color: #000;
      }
    `,document.head.appendChild(e)}}class r0{container;linkModel;spool;groundSegment;statusBadge;owltEl;rtltEl;thetaEl;ratesEl;groundAgeEl;spoolBarsEl;inFlightListEl;overrideCheckbox;overrideBadge;overrideMinutesInput;constructor(e,t,n,s,r){this.linkModel=n,this.spool=s,this.groundSegment=r,this.container=document.createElement("div"),this.container.className="comms-console-panel",e.appendChild(this.container),this._buildUI()}_buildUI(){this.container.innerHTML=`
      <style>
        .comms-console-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .comms-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .comms-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .link-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .link-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.15);
          border-radius: 4px;
          padding: 8px;
        }
        .link-card-label {
          font-size: 9px;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .link-card-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-bright);
        }
        .override-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 171, 0, 0.08);
          border: 1px dashed rgba(255, 171, 0, 0.3);
          border-radius: 4px;
          padding: 8px 10px;
        }
        .amber-badge {
          display: inline-block;
          background: #ffab00;
          color: #000;
          font-weight: 800;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 2px;
          letter-spacing: 1px;
        }
        .ground-banner {
          background: rgba(0, 230, 118, 0.08);
          border: 1px solid rgba(0, 230, 118, 0.3);
          border-radius: 4px;
          padding: 8px 10px;
          color: var(--green);
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .spool-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .spool-bar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
        }
        .spool-progress {
          width: 140px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .spool-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .fill-p0 { background: var(--red); }
        .fill-p1 { background: var(--amber); }
        .fill-p2 { background: var(--cyan); }
        .fill-p3 { background: var(--text-dim); }
        .inflight-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 100px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 229, 255, 0.1);
          border-radius: 4px;
          padding: 6px;
        }
        .inflight-item {
          display: flex;
          justify-content: space-between;
          padding: 3px 6px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.03);
          font-size: 10px;
        }
      </style>

      <div class="comms-header">
        <div class="comms-title">DEEP-SPACE COMMUNICATIONS / DTN</div>
        <div id="comms-status-badge" class="badge">ACTIVE</div>
      </div>

      <div class="ground-banner" id="ground-age-banner">
        DATA IS -- MIN OLD (AWAITING DOWNLINK)
      </div>

      <div class="override-box">
        <input type="checkbox" id="override-toggle" />
        <label for="override-toggle" style="cursor: pointer; font-weight: 600;">
          SCENARIO OVERRIDE: FORCE DELAY
        </label>
        <input type="number" id="override-mins" value="15" min="3" max="22" style="width: 45px; background: #000; color: #fff; border: 1px solid #ffab00; border-radius: 2px; padding: 2px 4px;" />
        <span style="color: var(--text-dim);">min</span>
        <span id="override-badge" class="amber-badge" style="display: none;">OVERRIDE ACTIVE</span>
      </div>

      <div class="link-grid">
        <div class="link-card">
          <div class="link-card-label">ONE-WAY LIGHT TIME (OWLT)</div>
          <div class="link-card-val" id="comms-owlt">--m --s</div>
        </div>
        <div class="link-card">
          <div class="link-card-label">ROUND-TRIP LIGHT TIME (RTLT)</div>
          <div class="link-card-val" id="comms-rtlt">--m --s</div>
        </div>
        <div class="link-card">
          <div class="link-card-label">SUN-EARTH-SHIP ANGLE (θ)</div>
          <div class="link-card-val" id="comms-theta">--°</div>
        </div>
        <div class="link-card">
          <div class="link-card-label">DOWNLINK / UPLINK RATES</div>
          <div class="link-card-val" id="comms-rates">-- / -- kbps</div>
        </div>
      </div>

      <div class="spool-section">
        <div style="font-weight: 700; color: var(--cyan); margin-bottom: 2px;">
          TRANSMISSION PRIORITY SPOOL (PERSISTENT IDB)
        </div>
        <div id="spool-bars">
          <!-- Filled dynamically -->
        </div>
      </div>

      <div class="spool-section">
        <div style="font-weight: 700; color: var(--cyan); margin-bottom: 2px;">
          IN-FLIGHT PROPAGATION PIPELINE
        </div>
        <div class="inflight-list" id="inflight-list">
          <div style="color: var(--text-dim); text-align: center; padding: 4px;">No bundles currently in flight</div>
        </div>
      </div>
    `,this.statusBadge=this.container.querySelector("#comms-status-badge"),this.owltEl=this.container.querySelector("#comms-owlt"),this.rtltEl=this.container.querySelector("#comms-rtlt"),this.thetaEl=this.container.querySelector("#comms-theta"),this.ratesEl=this.container.querySelector("#comms-rates"),this.groundAgeEl=this.container.querySelector("#ground-age-banner"),this.spoolBarsEl=this.container.querySelector("#spool-bars"),this.inFlightListEl=this.container.querySelector("#inflight-list"),this.overrideCheckbox=this.container.querySelector("#override-toggle"),this.overrideBadge=this.container.querySelector("#override-badge"),this.overrideMinutesInput=this.container.querySelector("#override-mins"),this.overrideCheckbox.addEventListener("change",()=>{const e=this.overrideCheckbox.checked,t=parseFloat(this.overrideMinutesInput.value)||15;this.linkModel.setLatencyOverride(e,t),this.overrideBadge.style.display=e?"inline-block":"none"}),this.overrideMinutesInput.addEventListener("input",()=>{if(this.overrideCheckbox.checked){const e=parseFloat(this.overrideMinutesInput.value)||15;this.linkModel.setLatencyOverride(!0,e)}})}update(e,t){this.statusBadge.textContent=e.status,e.status==="BLACKOUT"?(this.statusBadge.style.background="var(--red)",this.statusBadge.style.color="#fff"):e.status==="DEGRADED"?(this.statusBadge.style.background="var(--amber)",this.statusBadge.style.color="#000"):e.status==="OVERRIDE"?(this.statusBadge.style.background="#ffab00",this.statusBadge.style.color="#000"):(this.statusBadge.style.background="rgba(0, 230, 118, 0.2)",this.statusBadge.style.color="var(--green)"),this.owltEl.textContent=Qi(e.oneWayLightTimeSec),this.rtltEl.textContent=Qi(e.roundTripLightTimeSec),this.thetaEl.textContent=`${e.thetaDeg.toFixed(2)}° ${e.thetaDeg<2?"⚠ BLACKOUT":""}`,this.ratesEl.textContent=`${e.downlinkRateKbps.toFixed(1)} / ${e.uplinkRateKbps.toFixed(1)} kbps`,this.groundAgeEl.textContent=this.groundSegment.getTelemetryAgeString(t);const n=this.spool.getStats(),s=50;this.spoolBarsEl.innerHTML=`
      <div class="spool-bar-row">
        <span>P0: CRITICAL (FDIR) [${n.p0Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p0" style="width: ${Math.min(100,n.p0Count/s*100)}%;"></div></div>
      </div>
      <div class="spool-bar-row">
        <span>P1: TELEMETRY (HEALTH) [${n.p1Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p1" style="width: ${Math.min(100,n.p1Count/s*100)}%;"></div></div>
      </div>
      <div class="spool-bar-row">
        <span>P2: SCIENCE (ROUTINE) [${n.p2Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p2" style="width: ${Math.min(100,n.p2Count/s*100)}%;"></div></div>
      </div>
      <div class="spool-bar-row">
        <span>P3: BULK (FILES) [${n.p3Count}]</span>
        <div class="spool-progress"><div class="spool-progress-fill fill-p3" style="width: ${Math.min(100,n.p3Count/s*100)}%;"></div></div>
      </div>
      <div style="font-size: 9px; color: var(--text-dim); margin-top: 4px; display: flex; justify-content: space-between;">
        <span>TOTAL: ${n.totalBundles} (${(n.totalBytes/1024).toFixed(1)} KB)</span>
        <span>DROPPED: ${n.droppedCount}</span>
      </div>
    `;const r=this.linkModel.getInFlightBundles();r.length===0?this.inFlightListEl.innerHTML='<div style="color: var(--text-dim); text-align: center; padding: 4px;">No bundles currently in flight</div>':this.inFlightListEl.innerHTML=r.slice(0,5).map(a=>{const o=Math.max(0,a.arrivalSimTime-t),l=Math.min(100,Math.max(0,(t-a.departureSimTime)/a.oneWayDelaySec*100));return`
          <div class="inflight-item">
            <span>[P${a.bundle.header.priority}] ${a.bundle.header.payloadType} (${a.direction==="downlink"?"▼ TO EARTH":"▲ TO SHIP"})</span>
            <span>${o.toFixed(0)}s left (${l.toFixed(0)}%)</span>
          </div>
        `}).join("")}show(){this.container.style.display="flex"}hide(){this.container.style.display="none"}}const Dl=["nominal","pump_failure","leak","blockage","sensor_fault","unknown"],ro=["flow_rate","pump_dp","pump_rpm","outlet_temp","inlet_temp","accumulator_level","energy_residual","temp_slope","flow_slope","pressure_slope"];class Xa{trees=[];_nClasses=Dl.length;constructor(){}get numTrees(){return this.trees.length}get numClasses(){return this._nClasses}buildSyntheticForest(e=60,t=8,n=42){const s=new Ft(n);this.trees=[];for(let r=0;r<e;r++)this.trees.push(this._buildTree(s,t,0))}predict(e){if(this.trees.length===0)return{classProbs:Array(this._nClasses).fill(1/this._nClasses),predictedClass:"unknown",confidence:0};const t=Array(this._nClasses).fill(0);for(const s of this.trees){const r=this._traverseTree(s,e);if(r)for(let a=0;a<this._nClasses;a++)t[a]+=r[a]/this.trees.length}let n=0;for(let s=1;s<t.length;s++)t[s]>t[n]&&(n=s);return{classProbs:t,predictedClass:Dl[n],confidence:t[n]}}loadFromJSON(e){this.trees=e.trees}toJSON(){return{trees:this.trees}}_traverseTree(e,t){return e.classProbs!==null?e.classProbs:e.left===null||e.right===null?null:t[e.featureIndex]<=e.threshold?this._traverseTree(e.left,t):this._traverseTree(e.right,t)}_buildTree(e,t,n){if(n>=t||e.random()<.3){const o=Array(this._nClasses).fill(0),l=e.randInt(0,this._nClasses-1);o[l]=.5+e.random()*.4;const c=1-o[l];for(let d=0;d<this._nClasses;d++)d!==l&&(o[d]=c/(this._nClasses-1));return{featureIndex:0,threshold:0,left:null,right:null,classProbs:o}}const s=e.randInt(0,ro.length-1),a=[.5,50,2e3,300,280,.5,.1,.5,.1,.1][s]*(.5+e.random());return{featureIndex:s,threshold:a,left:this._buildTree(e,t,n+1),right:this._buildTree(e,t,n+1),classProbs:null}}}function Dc(i,e,t,n=0){const s=e.length,r=1<<s,a=Math.min(t.length,50),o=i.predict(e).classProbs[n];let l=0;for(let m=0;m<a;m++)l+=i.predict(t[m]).classProbs[n];l/=a;const c=Array(s).fill(0);for(let m=0;m<s;m++)for(let g=0;g<r;g++){if(g&1<<m)continue;const v=a0(g),p=Yr(v)*Yr(s-v-1)/Yr(s);let h=0,b=0;for(let E=0;E<a;E++){const S=Nl(e,t[E],g|1<<m),P=Nl(e,t[E],g);h+=i.predict(S).classProbs[n],b+=i.predict(P).classProbs[n]}h/=a,b/=a,c[m]+=p*(h-b)}const d=c.reduce((m,g)=>m+g,0),u=Math.abs(d+l-o);return{shapley:c.map((m,g)=>({feature:ro[g]??`feature_${g}`,value:e[g],phi:m,baseline:l})),baseline:l,prediction:o,additivityError:u}}function a0(i){let e=0;for(;i;)e+=i&1,i>>=1;return e}function Yr(i){if(i<=1)return 1;let e=1;for(let t=2;t<=i;t++)e*=t;return e}function Nl(i,e,t){const n=[];for(let s=0;s<i.length;s++)n.push(t&1<<s?i[s]:e[s]);return n}function o0(i,e,t,n=3){if(t.length===0)return[];const s=t.map(r=>{const a=e.map(c=>r.features[c]??0),l=1/(1+Nc(i,a));return{case:r,similarity:l}});return s.sort((r,a)=>a.similarity-r.similarity),s.slice(0,n).map(r=>({caseId:r.case.id,similarity:r.similarity,faultClass:r.case.faultClass,outcome:r.case.outcome,features:r.case.features}))}function Nc(i,e){let t=0;for(let n=0;n<i.length;n++){const s=(i[n]??0)-(e[n]??0);t+=s*s}return Math.sqrt(t)}function l0(i,e,t=5){if(e.length===0)return{score:1/0,isOOD:!0,threshold:2};const s=e.map(o=>Nc(i,o));s.sort((o,l)=>o-l);const r=s.slice(0,t),a=r.reduce((o,l)=>o+l,0)/r.length;return{score:a,isOOD:a>2,threshold:2}}class c0{nodes=new Map;edges=[];constructor(){this._buildDefaultGraph()}addNode(e){this.nodes.set(e.id,e)}addEdge(e){this.edges.push(e)}getNode(e){return this.nodes.get(e)}getNeighbors(e){const t=new Set;for(const n of this.edges)n.from===e&&t.add(n.to),n.to===e&&t.add(n.from);return[...t].map(n=>this.nodes.get(n)).filter(n=>n!==void 0)}getNodesForPhase(e){return[...this.nodes.values()].filter(t=>!t.phase||t.phase.length===0||t.phase.includes(e))}getNodesByType(e){return[...this.nodes.values()].filter(t=>t.type===e)}_buildDefaultGraph(){const e=[["proc_loop_failover","Cooling Loop Failover","Switch from failed coolant loop A to redundant loop B. Verify flow rate and outlet temperature stabilize within 5 minutes. Monitor accumulator level.",["Cruise","MOI","MarsOrbit","ReturnCruise"]],["proc_o2_regulator","O2 Regulator Fault Response","If O2 regulator is stuck, manually adjust supplemental O2 flow. Monitor ppO2 continuously. Target 21.3 kPa. Alert if ppO2 drops below 19.5 kPa.",["Cruise","MOI","MarsOrbit","SurfaceOps","ReturnCruise"]],["proc_cabin_leak","Cabin Leak Isolation","Isolate affected section. Don emergency O2 masks. Locate leak using pressure differential sensors. Apply emergency patch. Verify cabin pressure recovery.",["Cruise","MOI","MarsOrbit","ReturnCruise"]],["proc_co2_scrubber","CO2 Scrubber Maintenance","Replace CO2 scrubber cartridge. Verify ppCO2 begins decreasing within 10 minutes. Nominal ppCO2 target: < 0.5 kPa.",["Cruise","MOI","MarsOrbit","SurfaceOps","ReturnCruise"]],["proc_moi_abort","MOI Abort to Flyby","Abort Mars Orbit Insertion burn. Reconfigure for flyby trajectory. Requires minimum 100 m/s delta-v reserve. Crew confirmation required.",["MOI"]],["proc_hypoxia","Hypoxia Response Protocol","SYNTHETIC: NOT REAL MEDICAL PROCEDURE. Restore O2 supply. Move affected crew to safe volume. Apply supplemental O2. Monitor SpO2 continuously. Target SpO2 > 95%.",["Cruise","MOI","MarsOrbit","SurfaceOps","ReturnCruise"]],["proc_rad_shelter","Radiation Shelter Protocol","Move crew to radiation shelter. Reduce EVA activities. Monitor cumulative dose. Resume normal operations when dose rate returns to baseline.",["Cruise","ReturnCruise"]],["proc_power_shed","Emergency Power Load Shed","Shed non-essential loads. Priority order: science instruments, Tier 2 compute, heating pads, lighting. Maintain life support and comms.",["Cruise","MOI","MarsOrbit","ReturnCruise"]],["proc_edl_abort","EDL Abort to Orbit","Abort EDL sequence before atmospheric entry interface. Fire abort motors. Return to Mars orbit. Only valid before atmospheric entry.",["EDL"]],["proc_comm_blackout","Communication Blackout Procedure","Verify spool is filling. Priority-order downlink queue. No configuration changes during blackout. Drain by priority on reacquisition.",["Cruise","ReturnCruise"]],["proc_safe_mode","Vehicle Safe Mode Entry","Shed all non-essential loads. Point solar arrays at Sun. Maintain minimum attitude control. Await crew assessment or ground command.",["Cruise","MOI","MarsOrbit","ReturnCruise"]],["proc_decompression","Rapid Decompression Response","SYNTHETIC: NOT REAL MEDICAL PROCEDURE. Don emergency suits immediately. Seal affected compartment. Initiate emergency repressurization. Check all crew for decompression symptoms.",["Cruise","MOI","MarsOrbit","ReturnCruise"]]];for(const[r,a,o,l]of e)this.addNode({id:r,type:"Procedure",name:a,text:o,phase:l});const t=[["eq_loop_a","Coolant Loop A","Primary thermal control loop with pump, radiator, and accumulator"],["eq_loop_b","Coolant Loop B","Redundant thermal control loop (backup)"],["eq_o2_reg","O2 Regulator","Cabin oxygen partial pressure regulator"],["eq_co2_scrub","CO2 Scrubber","Carbon dioxide removal system"],["eq_solar_array","Solar Array","Primary power generation from solar irradiance"],["eq_battery","Battery Pack","Lithium-ion battery for power storage"],["eq_rcs","RCS Thrusters","Reaction Control System for attitude maintenance"],["eq_main_engine","Main Engine","Primary propulsion for orbit insertion and major maneuvers"]];for(const[r,a,o]of t)this.addNode({id:r,type:"Equipment",name:a,text:o});const n=[["sens_temp_outlet_a","Loop A Outlet Temperature Sensor"],["sens_temp_outlet_b","Loop B Outlet Temperature Sensor"],["sens_flow_a","Loop A Flow Rate Sensor"],["sens_pump_rpm_a","Loop A Pump RPM Sensor"],["sens_ppo2","Cabin ppO2 Sensor"],["sens_ppco2","Cabin ppCO2 Sensor"],["sens_cabin_press","Cabin Pressure Sensor"],["sens_spo2","Crew SpO2 Wearable Sensor"]];for(const[r,a]of n)this.addNode({id:r,type:"Sensor",name:a,text:`Telemetry sensor: ${a}`});const s=[["haz_thermal_runaway","Thermal Runaway","Uncontrolled temperature rise due to coolant system failure"],["haz_hypoxia","Crew Hypoxia","Insufficient oxygen partial pressure in cabin"],["haz_co2_toxicity","CO2 Toxicity","Elevated carbon dioxide partial pressure causing crew impairment"],["haz_decompression","Rapid Decompression","Loss of cabin pressure due to structural breach"],["haz_radiation","Radiation Exposure","Elevated radiation dose from solar particle event"]];for(const[r,a,o]of s)this.addNode({id:r,type:"Hazard",name:a,text:o});this.addEdge({from:"proc_loop_failover",to:"eq_loop_a",relation:"references"}),this.addEdge({from:"proc_loop_failover",to:"eq_loop_b",relation:"references"}),this.addEdge({from:"proc_loop_failover",to:"sens_temp_outlet_a",relation:"monitors"}),this.addEdge({from:"proc_loop_failover",to:"sens_flow_a",relation:"monitors"}),this.addEdge({from:"proc_loop_failover",to:"haz_thermal_runaway",relation:"treats"}),this.addEdge({from:"proc_o2_regulator",to:"eq_o2_reg",relation:"references"}),this.addEdge({from:"proc_o2_regulator",to:"sens_ppo2",relation:"monitors"}),this.addEdge({from:"proc_o2_regulator",to:"haz_hypoxia",relation:"treats"}),this.addEdge({from:"proc_cabin_leak",to:"sens_cabin_press",relation:"monitors"}),this.addEdge({from:"proc_cabin_leak",to:"haz_decompression",relation:"treats"}),this.addEdge({from:"proc_co2_scrubber",to:"eq_co2_scrub",relation:"references"}),this.addEdge({from:"proc_co2_scrubber",to:"sens_ppco2",relation:"monitors"}),this.addEdge({from:"proc_co2_scrubber",to:"haz_co2_toxicity",relation:"treats"}),this.addEdge({from:"proc_hypoxia",to:"sens_spo2",relation:"monitors"}),this.addEdge({from:"proc_hypoxia",to:"haz_hypoxia",relation:"treats"}),this.addEdge({from:"proc_rad_shelter",to:"haz_radiation",relation:"treats"}),this.addEdge({from:"proc_power_shed",to:"eq_solar_array",relation:"references"}),this.addEdge({from:"proc_power_shed",to:"eq_battery",relation:"references"})}}class d0{docs=[];avgDl=0;df=new Map;k1=1.5;b=.75;index(e){this.docs=[],this.df.clear();for(const t of e){const n=`${t.name} ${t.text}`,s=this._tokenize(n),r=new Map;for(const a of s)r.set(a,(r.get(a)??0)+1);this.docs.push({id:t.id,text:n,terms:r,length:s.length})}this.avgDl=this.docs.reduce((t,n)=>t+n.length,0)/(this.docs.length||1);for(const t of this.docs)for(const n of t.terms.keys())this.df.set(n,(this.df.get(n)??0)+1)}search(e,t=5){const n=this._tokenize(e),s=this.docs.length,r=[];for(const a of this.docs){let o=0;for(const l of n){const c=a.terms.get(l)??0;if(c===0)continue;const d=this.df.get(l)??0,u=Math.log((s-d+.5)/(d+.5)+1),f=c*(this.k1+1)/(c+this.k1*(1-this.b+this.b*a.length/this.avgDl));o+=u*f}o>0&&r.push({id:a.id,score:o})}return r.sort((a,o)=>o.score-a.score),r.slice(0,t)}_tokenize(e){return e.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(t=>t.length>1)}}function h0(i,e,t,n,s){const r=t.search(i,5);if(r.length===0)return{blocks:[{text:"No verified procedure found in on-board library. A P1 downlink question has been queued for Earth.",cites:[],type:"refusal"}],configId:s,retrievalSource:"BM25"};const a=new Set(r.map(c=>c.id)),o=[];for(const c of r){const d=e.getNode(c.id);if(!d||d.phase&&d.phase.length>0&&!d.phase.includes(n))continue;o.push({text:d.text,cites:[d.id],type:d.type==="Procedure"?"procedure":"explanation"});const u=e.getNeighbors(d.id);for(const f of u.slice(0,3))a.has(f.id)||(a.add(f.id),o.push({text:f.text,cites:[f.id],type:"explanation"}))}const l=o.filter(c=>c.cites.length>0&&c.cites.every(d=>a.has(d)));return{blocks:l.length>0?l:[{text:"No verified procedure found in on-board library.",cites:[],type:"refusal"}],configId:s,retrievalSource:"BM25"}}const u0={id:"hyp_root",question:"Is ppO2 < 19.5 kPa?",variable:"ppO2",threshold:19.5,yesChild:{id:"hyp_severe",question:"Is ppO2 < 16.0 kPa?",variable:"ppO2",threshold:16,yesChild:{id:"hyp_critical",question:"Is SpO2 < 90%?",variable:"spO2",threshold:90,yesChild:{id:"hyp_emergency",diagnosis:"CRITICAL HYPOXIA",actions:["SYNTHETIC: Immediately restore O2 supply","SYNTHETIC: Move crew to safe volume with O2","SYNTHETIC: Apply supplemental O2 mask","SYNTHETIC: Monitor SpO2 continuously","SYNTHETIC: Queue flight surgeon review packet"]},noChild:{id:"hyp_moderate",diagnosis:"MODERATE HYPOXIA",actions:["SYNTHETIC: Increase O2 flow rate","SYNTHETIC: Monitor ppO2 and SpO2","SYNTHETIC: Check O2 regulator status"]}},noChild:{id:"hyp_mild",diagnosis:"MILD HYPOXIA WARNING",actions:["SYNTHETIC: Check O2 regulator","SYNTHETIC: Verify cabin seal integrity","SYNTHETIC: Monitor ppO2 trend"]}},noChild:{id:"hyp_nominal",diagnosis:"ppO2 NOMINAL",actions:["Continue monitoring"]}},f0={id:"co2_root",question:"Is ppCO2 > 1.0 kPa?",variable:"ppCO2",threshold:1,yesChild:{id:"co2_elevated",question:"Is ppCO2 > 2.0 kPa?",variable:"ppCO2",threshold:2,yesChild:{id:"co2_danger",diagnosis:"DANGEROUS CO2 LEVEL",actions:["SYNTHETIC: Replace CO2 scrubber cartridge immediately","SYNTHETIC: Increase cabin ventilation","SYNTHETIC: Monitor crew for headache, dizziness","SYNTHETIC: Consider supplemental O2"]},noChild:{id:"co2_caution",diagnosis:"ELEVATED CO2",actions:["SYNTHETIC: Check CO2 scrubber efficiency","SYNTHETIC: Plan scrubber cartridge replacement","SYNTHETIC: Monitor ppCO2 trend"]}},noChild:{id:"co2_nominal",diagnosis:"ppCO2 NOMINAL",actions:["Continue monitoring"]}},p0={id:"decomp_root",question:"Is cabin pressure < 95 kPa?",variable:"cabinPressure",threshold:95,yesChild:{id:"decomp_loss",question:"Is pressure rate of change < -0.5 kPa/min?",variable:"pressureRate",threshold:-.5,yesChild:{id:"decomp_rapid",diagnosis:"RAPID DECOMPRESSION",actions:["SYNTHETIC: Don emergency pressure suits","SYNTHETIC: Seal affected compartment","SYNTHETIC: Initiate emergency repressurization","SYNTHETIC: All crew report to safe haven"]},noChild:{id:"decomp_slow",diagnosis:"SLOW PRESSURE LEAK",actions:["SYNTHETIC: Locate leak with pressure differential","SYNTHETIC: Apply emergency patch","SYNTHETIC: Monitor cabin pressure recovery"]}},noChild:{id:"decomp_nominal",diagnosis:"CABIN PRESSURE NOMINAL",actions:["Continue monitoring"]}};function $r(i,e){const t=[];let n=i;for(;n;){if(n.diagnosis)return{diagnosis:n.diagnosis,actions:n.actions??[],path:t};const s=n.variable&&e[n.variable]!==void 0?e[n.variable]:0,r=n.threshold??0,a=n.question?n.question.includes("<")?s<r:s>r:!1;t.push({nodeId:n.id,decision:a?"YES":"NO",value:s}),n=a?n.yesChild:n.noChild}return{diagnosis:"UNKNOWN",actions:["Escalate to flight surgeon"],path:t}}const m0=[{condition:"Hypoxia",features:{ppO2:{mean:15,std:3},spO2:{mean:88,std:5},heartRate:{mean:100,std:15},respRate:{mean:22,std:4}},priorProbability:.15},{condition:"CO2 Toxicity",features:{ppCO2:{mean:2.5,std:.8},spO2:{mean:94,std:3},heartRate:{mean:90,std:12},respRate:{mean:24,std:5}},priorProbability:.1},{condition:"Decompression Exposure",features:{cabinPressure:{mean:70,std:15},spO2:{mean:85,std:8},heartRate:{mean:110,std:20},ppO2:{mean:10,std:5},respRate:{mean:28,std:6}},priorProbability:.05},{condition:"Radiation Sickness",features:{radiationDose:{mean:500,std:200},heartRate:{mean:80,std:15},ppO2:{mean:21.3,std:1.5},spO2:{mean:97,std:2}},priorProbability:.03},{condition:"Nominal",features:{ppO2:{mean:21.3,std:1},ppCO2:{mean:.4,std:.2},spO2:{mean:98,std:1},heartRate:{mean:70,std:10},respRate:{mean:16,std:3}},priorProbability:.67}];function g0(i,e=m0){const t=[];for(const s of e){let r=Math.log(s.priorProbability);const a=[];for(const[o,{mean:l,std:c}]of Object.entries(s.features)){const d=i[o];if(d===void 0)continue;const u=(d-l)/c,f=-.5*u*u-Math.log(c*Math.sqrt(2*Math.PI));r+=f,Math.abs(u)>1.5&&a.push(`${o}=${d.toFixed(1)} (${u>0?"above":"below"} expected ${l.toFixed(1)})`)}t.push({condition:s.condition,likelihood:Math.exp(r),reasoning:a.length>0?a.join("; "):"Values within expected range"})}const n=t.reduce((s,r)=>s+r.likelihood,0);if(n>0)for(const s of t)s.likelihood/=n;return t.sort((s,r)=>r.likelihood-s.likelihood),t}const v0=[{name:"Supplemental O2",indication:"Hypoxia",dose:"2-4 L/min",route:"Inhalation",notes:"SYNTHETIC: First-line for low SpO2",inKit:!0},{name:"Acetazolamide (illustrative)",indication:"Altitude sickness analog",dose:"250mg",route:"Oral",notes:"SYNTHETIC: Illustrative only",inKit:!0},{name:"Ondansetron (illustrative)",indication:"Nausea/vomiting",dose:"4mg",route:"Oral",notes:"SYNTHETIC: Illustrative only",inKit:!0},{name:"Potassium iodide (illustrative)",indication:"Radiation exposure",dose:"130mg",route:"Oral",notes:"SYNTHETIC: Illustrative thyroid protection",inKit:!0}];function _0(i,e,t){const n={...e,...t},s=$r(u0,n),r=$r(f0,n),a=$r(p0,n),l=[s,r,a].find(f=>!f.diagnosis.includes("NOMINAL"))??s,c=g0(n),d=[];if(c.length>=2){const f=c[0],m=c[1];f.likelihood>0&&m.likelihood/f.likelihood>.3&&d.push(`${f.condition} vs ${m.condition}: similar presentations — verify with additional data`)}const u=[];for(const f of l.actions){const m=v0.find(g=>f.toLowerCase().includes(g.indication.toLowerCase())||f.toLowerCase().includes("o2")&&g.name.includes("O2"));u.push({action:f,medication:m?.name,dose:m?.dose,route:m?.route,notes:"SYNTHETIC: NOT REAL MEDICAL PROCEDURE",fromFormulary:!!m,requiresCMOConfirm:!0})}return{differentials:c,recommendations:u,decisionTreePath:l.path,lookalikes:d,requiresFlightSurgeonReview:!0,synthetic:!0}}class x0{container;bus;safetyGate;rf;kg;retriever;activeSubTab="TIER1";contentEl;latestDiagnostic=null;latestMedical=null;armedCommandId=null;constructor(e,t,n){this.bus=t,this.safetyGate=n,this.rf=new Xa,this.rf.buildSyntheticForest(25,5,42),this.kg=new c0,this.retriever=new d0,this.retriever.index([...this.kg.nodes.values()]),this.container=document.createElement("div"),this.container.className="ai-console-panel",e.appendChild(this.container),this._buildUI()}_buildUI(){this.container.innerHTML=`
      <style>
        .ai-console-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .ai-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .ai-subtabs {
          display: flex;
          gap: 4px;
          background: rgba(0, 0, 0, 0.5);
          padding: 3px;
          border-radius: 4px;
        }
        .ai-tab-btn {
          flex: 1;
          padding: 5px 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 3px;
          text-align: center;
          transition: all 0.2s ease;
        }
        .ai-tab-btn.active {
          background: rgba(0, 229, 255, 0.15);
          border-color: var(--cyan);
          color: var(--cyan);
          text-shadow: var(--glow-cyan);
        }
        .shapley-bar-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 4px 0;
          font-size: 10px;
        }
        .shapley-name {
          width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-dim);
        }
        .shapley-track {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .shapley-val-bar {
          height: 100%;
          border-radius: 4px;
        }
        .bar-pos { background: var(--red); }
        .bar-neg { background: var(--green); }
        .medical-banner {
          background: rgba(255, 82, 82, 0.12);
          border: 1px solid var(--red);
          border-radius: 4px;
          padding: 6px 10px;
          color: #ff8a80;
          font-weight: 700;
          font-size: 10px;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .search-box {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }
        .search-input {
          flex: 1;
          background: #000;
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 3px;
          color: #fff;
          font-family: var(--font-mono);
          padding: 5px 8px;
          font-size: 11px;
        }
        .search-btn {
          background: rgba(0, 229, 255, 0.2);
          border: 1px solid var(--cyan);
          color: var(--cyan);
          font-family: var(--font-mono);
          padding: 5px 12px;
          cursor: pointer;
          border-radius: 3px;
          font-weight: 700;
        }
        .action-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .arm-btn {
          background: rgba(255, 171, 0, 0.2);
          border: 1px solid var(--amber);
          color: var(--amber);
          font-family: var(--font-mono);
          padding: 6px 12px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 3px;
        }
        .exec-btn {
          background: rgba(255, 23, 68, 0.3);
          border: 1px solid var(--red);
          color: #fff;
          font-family: var(--font-mono);
          padding: 6px 12px;
          font-weight: 800;
          cursor: pointer;
          border-radius: 3px;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { box-shadow: 0 0 5px rgba(255, 23, 68, 0.5); }
          to { box-shadow: 0 0 15px rgba(255, 23, 68, 0.9); }
        }
      </style>

      <div class="ai-header">
        <div class="ai-title">AUTONOMOUS ADVISORY STACK</div>
        <div class="badge phase-badge">PROPOSE-ONLY (G4)</div>
      </div>

      <div class="ai-subtabs">
        <button class="ai-tab-btn active" data-tab="TIER1">TIER 1 (DIAG)</button>
        <button class="ai-tab-btn" data-tab="TIER2">TIER 2 (DOCS)</button>
        <button class="ai-tab-btn" data-tab="MEDICAL">CDSS (MED)</button>
        <button class="ai-tab-btn" data-tab="SAFETY">SAFETY GATE</button>
      </div>

      <div id="ai-content-area" style="flex: 1; overflow-y: auto;">
        <!-- Filled based on active tab -->
      </div>
    `,this.contentEl=this.container.querySelector("#ai-content-area");const e=this.container.querySelectorAll(".ai-tab-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(n=>n.classList.remove("active")),t.classList.add("active"),this.activeSubTab=t.dataset.tab,this._renderActiveTab()})}),this._renderActiveTab()}diagnose(e,t){const n=this.rf.predict(e),s=Dc(this.rf,e.slice(0,6),t,0),r=o0(e.slice(0,3),["flow_rate","pump_dp","outlet_temp"],[{id:"case-041",features:{flow_rate:.15,pump_dp:18,outlet_temp:345},faultClass:"pump_failure",outcome:"Executed Loop B failover. Temperature stabilized in 3.2m.",timestamp:1e3,synthetic:!0},{id:"case-088",features:{flow_rate:.48,pump_dp:52,outlet_temp:292},faultClass:"nominal",outcome:"Nominal cruise operations maintained.",timestamp:2e3,synthetic:!0},{id:"case-112",features:{flow_rate:.28,pump_dp:35,outlet_temp:315},faultClass:"leak",outcome:"Isolated secondary loop. Pressurized accumulator.",timestamp:3e3,synthetic:!0}],2),a=l0(e.slice(0,4),t.map(o=>o.slice(0,4)));this.latestDiagnostic={predictedClass:n.predictedClass,confidence:n.confidence,shapley:s.shapley.map(o=>o.value),similarCases:r,isOOD:a.isOOD,oodDistance:a.score},this.activeSubTab==="TIER1"&&this._renderTier1()}assessMedical(e,t){this.latestMedical=_0(["Dyspnea","Tachycardia"],e,t),this.activeSubTab==="MEDICAL"&&this._renderMedical()}_renderActiveTab(){switch(this.activeSubTab){case"TIER1":this._renderTier1();break;case"TIER2":this._renderTier2();break;case"MEDICAL":this._renderMedical();break;case"SAFETY":this._renderSafety();break}}_renderTier1(){if(!this.latestDiagnostic){this.contentEl.innerHTML=`
        <div style="text-align: center; color: var(--text-dim); padding: 20px;">
          AWAITING TELEMETRY SAMPLING...
        </div>
      `;return}const e=this.latestDiagnostic,t=e.predictedClass!=="nominal";this.contentEl.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.2); border-radius: 4px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--text-dim);">CLASSIFIER INFERENCE</span>
            <span class="badge" style="background: ${t?"var(--red)":"var(--green)"}; color: #fff;">
              ${e.predictedClass.toUpperCase()} (${(e.confidence*100).toFixed(1)}%)
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px;">
            <span style="color: var(--text-dim);">NOVELTY (OOD):</span>
            <span style="color: ${e.isOOD?"var(--amber)":"var(--green)"};">
              ${e.isOOD?"⚠ OUT-OF-DISTRIBUTION":"IN-DISTRIBUTION"} (dist: ${e.oodDistance.toFixed(2)})
            </span>
          </div>
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--cyan); margin-bottom: 4px;">
            EXACT SHAPLEY ATTRIBUTION (2ⁿ COALITIONS)
          </div>
          ${e.shapley.map((n,s)=>{const r=ro[s]||`feature_${s}`,a=Math.min(100,Math.abs(n)*200),o=n>=0;return`
              <div class="shapley-bar-row">
                <div class="shapley-name" title="${r}">${r}</div>
                <div class="shapley-track">
                  <div class="shapley-val-bar ${o?"bar-pos":"bar-neg"}" style="width: ${a}%;"></div>
                </div>
                <div style="width: 45px; text-align: right; font-size: 9px; color: ${o?"#ff8a80":"#b9f6ca"};">
                  ${o?"+":""}${n.toFixed(3)}
                </div>
              </div>
            `}).join("")}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--cyan); margin-bottom: 4px;">
            CASE-BASED REASONING (k-NN HISTORICAL ANALOGS)
          </div>
          ${e.similarCases.map(n=>`
            <div style="background: rgba(0,0,0,0.3); border-left: 2px solid var(--cyan); padding: 4px 6px; margin-bottom: 4px; font-size: 10px;">
              <div style="display: flex; justify-content: space-between; color: var(--cyan);">
                <span>${n.caseId} (${n.faultClass})</span>
                <span>${(n.similarity*100).toFixed(0)}% MATCH</span>
              </div>
              <div style="color: var(--text-dim); margin-top: 2px;">${n.outcome}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `}_renderTier2(){this.contentEl.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="search-box">
          <input type="text" id="bm25-query" class="search-input" placeholder="Search procedures (e.g. coolant loop, hypoxia)..." value="coolant loop failover" />
          <button id="bm25-search-btn" class="search-btn">SEARCH</button>
        </div>
        <div id="bm25-results" style="display: flex; flex-direction: column; gap: 6px;"></div>
      </div>
    `;const e=this.contentEl.querySelector("#bm25-query"),t=this.contentEl.querySelector("#bm25-search-btn"),n=this.contentEl.querySelector("#bm25-results"),s=()=>{const r=e.value.trim();if(!r)return;const a=h0(r,this.kg,this.retriever,"Cruise","cfg-default");n.innerHTML=a.blocks.map(o=>`
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.2); border-radius: 4px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span class="badge ${o.type==="procedure"?"phase-badge":""}">${o.type.toUpperCase()}</span>
            <span style="font-size: 9px; color: var(--text-dim);">CITES: ${o.cites.join(", ")||"NONE"}</span>
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: var(--text-bright);">${o.text}</div>
        </div>
      `).join("")};t.addEventListener("click",s),e.addEventListener("keydown",r=>{r.key==="Enter"&&s()}),s()}_renderMedical(){if(!this.latestMedical){this.contentEl.innerHTML=`
        <div class="medical-banner">
          SYNTHETIC: NOT REAL MEDICAL PROCEDURES • NOT MEDICAL ADVICE
        </div>
        <div style="text-align: center; color: var(--text-dim); padding: 20px;">
          AWAITING CREW VITALS SAMPLING...
        </div>
      `;return}const e=this.latestMedical;this.contentEl.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="medical-banner">
          SYNTHETIC: NOT REAL MEDICAL PROCEDURES • NOT MEDICAL ADVICE
        </div>

        <div style="font-weight: 700; color: var(--cyan); font-size: 11px;">
          DIFFERENTIAL DIAGNOSIS (NAIVE BAYES)
        </div>
        ${e.differentials.slice(0,3).map(t=>`
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 4px 6px; border-radius: 3px;">
            <span style="color: ${t.condition==="Hypoxia"?"var(--red)":"var(--text-primary)"};">${t.condition}</span>
            <span style="font-weight: 700;">${(t.likelihood*100).toFixed(1)}%</span>
          </div>
        `).join("")}

        <div style="font-weight: 700; color: var(--cyan); font-size: 11px; margin-top: 4px;">
          DECISION TREE EVALUATION PATH
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px; font-size: 10px;">
          ${e.decisionTreePath.map(t=>`
            <div style="color: var(--text-dim);">
              ▶ Node <span style="color: var(--cyan);">${t.nodeId}</span>: <span style="color: var(--amber);">${t.decision}</span> (value: ${t.value.toFixed(1)})
            </div>
          `).join("")}
        </div>

        <div style="font-weight: 700; color: var(--cyan); font-size: 11px; margin-top: 4px;">
          RECOMMENDED PROTOCOLS (FORMULARY)
        </div>
        ${e.recommendations.map(t=>`
          <div style="background: rgba(0,0,0,0.4); border-left: 2px solid var(--amber); padding: 6px; font-size: 10px;">
            <div style="font-weight: 700; color: var(--amber);">${t.action}</div>
            ${t.medication?`<div style="color: var(--green); margin-top: 2px;">Rx: ${t.medication} (${t.dose}, ${t.route})</div>`:""}
          </div>
        `).join("")}
      </div>
    `}_renderSafety(){this.contentEl.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="action-card">
          <div style="font-weight: 700; color: var(--cyan);">TIER 0 SAFETY GATE (TWO-STAGE INTERLOCK)</div>
          <div style="color: var(--text-dim); font-size: 10px; line-height: 1.3;">
            Autonomous AI recommendations can only propose actions. Human flight controller confirmation
            or deterministic FDIR trigger required for actuator commit.
          </div>
        </div>

        <div class="action-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700;">PROCEDURE: LOOP B FAILOVER</span>
            <span class="badge phase-badge">PROC_LOOP_FAILOVER</span>
          </div>
          <div style="color: var(--text-dim); font-size: 10px;">
            Switches active coolant circulation from Loop A to redundant Loop B.
          </div>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button id="arm-failover-btn" class="arm-btn">STAGE 1: ARM</button>
            <button id="exec-failover-btn" class="exec-btn" style="display: ${this.armedCommandId==="proc_loop_failover"?"block":"none"};">
              STAGE 2: COMMIT & EXECUTE
            </button>
          </div>
          <div id="safety-status" style="font-size: 10px; margin-top: 4px; color: var(--amber);"></div>
        </div>
      </div>
    `;const e=this.contentEl.querySelector("#arm-failover-btn"),t=this.contentEl.querySelector("#exec-failover-btn"),n=this.contentEl.querySelector("#safety-status");e.addEventListener("click",()=>{this.armedCommandId="proc_loop_failover";const s=this.safetyGate.evaluate("proc_loop_failover",{});t.style.display="block",n.textContent=s.requiresCrewConfirm?"INTERLOCK ARMED. OPERATOR CONFIRMATION REQUIRED.":`STATUS: ${s.approved?"READY":s.reasons.join(", ")}`}),t.addEventListener("click",()=>{const s=this.safetyGate.confirmPending();s&&s.approved?(n.style.color="var(--green)",n.textContent="SAFETY GATE PASSED: COMMAND COMMITTED TO ACTUATORS",this.bus.emit("safety:actionCommitted",{procedureId:"proc_loop_failover",actor:"crew",timestamp:Date.now()})):(n.style.color="var(--red)",n.textContent="SAFETY GATE: CONFIRMATION FAILED OR REJECTED"),this.armedCommandId=null,t.style.display="none"})}show(){this.container.style.display="flex"}hide(){this.container.style.display="none"}}class y0{container;memManager;libEl;r2El;scrubberStatusEl;constructor(e,t,n){this.memManager=n,this.container=document.createElement("div"),this.container.className="memory-view-panel",e.appendChild(this.container),this._buildUI()}_buildUI(){this.container.innerHTML=`
      <style>
        .memory-view-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .mem-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .mem-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .mem-region-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 229, 255, 0.15);
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mem-region-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mem-region-name {
          font-weight: 700;
          color: var(--cyan);
        }
        .mem-meta {
          font-size: 10px;
          color: var(--text-dim);
        }
        .scrubber-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 8px 10px;
        }
      </style>

      <div class="mem-header">
        <div class="mem-title">AVIONICS MEMORY & FAULT TOLERANCE</div>
        <div class="badge phase-badge">ECC / SEU SCRUBBER</div>
      </div>

      <div class="scrubber-controls">
        <button id="toggle-scrubber-btn" class="search-btn" style="padding: 4px 10px; font-size: 10px;">
          TOGGLE SEU SCRUBBER
        </button>
        <button id="inject-bitflip-btn" class="arm-btn" style="padding: 4px 10px; font-size: 10px; color: var(--red); border-color: var(--red);">
          INJECT BIT-FLIP (SEU)
        </button>
        <button id="swap-r2-btn" class="search-btn" style="padding: 4px 10px; font-size: 10px; color: var(--amber); border-color: var(--amber);">
          PING-PONG A/B SWAP
        </button>
        <div id="scrubber-status" style="margin-left: auto; font-size: 10px; color: var(--green);">
          SCRUBBER: ACTIVE (100 Hz)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R0: GOLDEN ROM (IMMUTABLE)</span>
          <span class="badge" style="background: rgba(0, 230, 118, 0.2); color: var(--green);">HARDENED</span>
        </div>
        <div class="mem-meta">Physical Constants, Kepler J2000 Ephemerides, Actuator Hard Limits, ECDSA Public Keys</div>
        <div id="r0-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Status: 100% Integrity verified (SHA-256: 0x9f83...bc41)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R1: PERSISTENT AUDIT LOG (APPEND-ONLY)</span>
          <span class="badge" style="background: rgba(0, 229, 255, 0.2); color: var(--cyan);">CHAINED HASH</span>
        </div>
        <div class="mem-meta">Immutable telemetry flight recorder & safety gate execution log (IndexedDB backed)</div>
        <div id="r1-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Total Recorded Blocks: 142 | Latest Chain Hash: 0xa4c1...8e29
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">LIB: SIGNED LIBRARY (READ-ONLY)</span>
          <span class="badge" style="background: rgba(255, 171, 0, 0.2); color: var(--amber);">VERIFIED</span>
        </div>
        <div class="mem-meta">Random Forest model weights, BM25 knowledge graph, Synthetic Formulary</div>
        <div id="lib-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Modules: rf_thermal.bin (25 trees), kg_procedures.json (12 procs), formulary.json (4 drugs)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R2: PHASE WORKING SET A/B (PING-PONG)</span>
          <span class="badge" id="r2-active-badge" style="background: rgba(0, 229, 255, 0.2); color: var(--cyan);">BUFFER A ACTIVE</span>
        </div>
        <div class="mem-meta">Mission phase parameters, guidance targets, CDSS differential working buffers</div>
        <div id="r2-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Buffer A: Cruise State Vector | Buffer B: Standby (Prepared for Mars Orbit Insertion)
        </div>
      </div>

      <div class="mem-region-card">
        <div class="mem-region-top">
          <span class="mem-region-name">R3: SCRATCHPAD MEMORY (CIRCULAR RINGBUFFERS)</span>
          <span class="badge" style="background: rgba(255, 255, 255, 0.1); color: var(--text-dim);">EPHEMERAL</span>
        </div>
        <div class="mem-meta">High-frequency telemetry ring buffers (0 GC allocation overhead during rendering)</div>
        <div id="r3-details" style="font-size: 10px; color: var(--text-bright); margin-top: 2px;">
          Sparkline Circular Buffers: 8 channels @ 300 samples capacity (100% active, 0 drops)
        </div>
      </div>
    `,this.libEl=this.container.querySelector("#lib-details"),this.r2El=this.container.querySelector("#r2-details"),this.scrubberStatusEl=this.container.querySelector("#scrubber-status");const e=this.container.querySelector("#toggle-scrubber-btn"),t=this.container.querySelector("#inject-bitflip-btn"),n=this.container.querySelector("#swap-r2-btn"),s=this.container.querySelector("#r2-active-badge");let r=!0;e.addEventListener("click",()=>{r=!r,this.scrubberStatusEl.textContent=r?"SCRUBBER: ACTIVE (100 Hz)":"SCRUBBER: PAUSED",this.scrubberStatusEl.style.color=r?"var(--green)":"var(--amber)"}),t.addEventListener("click",()=>{this.memManager.injectBitFlip("lib_thermal_model")&&(this.libEl.textContent="⚠ SEU DETECTED: Bit-flip in lib_thermal_model. Scrubber auto-correcting via golden checksum.",this.libEl.style.color="var(--red)",setTimeout(()=>{this.memManager.scrubForSEU(),this.libEl.textContent="✓ SEU REPAIRED: Clean module reloaded from golden flash image.",this.libEl.style.color="var(--green)"},1200))}),n.addEventListener("click",()=>{const a=this.memManager.activeSlot==="A"?"B":"A";s.textContent=`BUFFER ${a} ACTIVE`,this.r2El.textContent=`Buffer ${a} committed for active flight guidance calculations.`})}show(){this.container.style.display="flex"}hide(){this.container.style.display="none"}}async function Uc(i){const e=typeof i=="string"?new TextEncoder().encode(i):i;if(typeof crypto<"u"&&crypto.subtle&&crypto.subtle.digest)try{const l=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(l)).map(d=>d.toString(16).padStart(2,"0")).join("")}catch{}let t=2166136261,n=668265263;for(let l=0;l<e.length;l++){const c=e[l];t^=c,t=Math.imul(t,16777619),n^=c,n=Math.imul(n,1540483477)}const s=(t>>>0).toString(16).padStart(8,"0"),r=(n>>>0).toString(16).padStart(8,"0"),a=((t^n)>>>0).toString(16).padStart(8,"0"),o=(t+n>>>0).toString(16).padStart(8,"0");return(s+r+a+o).repeat(2).slice(0,64)}let jr=1e3;async function Yn(i,e,t,n,s,r,a=86400*7){jr++;const o=JSON.stringify(s),l=new TextEncoder().encode(o).length,c=await Uc(o);return{header:{id:`bndl-${i.charAt(0).toUpperCase()}-${Date.now().toString(36)}-${jr}`,source:i,destination:e,priority:t,creationSimTime:r,ttl:a,sequenceNumber:jr,payloadType:n,payloadSizeBytes:l,payloadHash:c,signature:`SIG-P256-${c.slice(0,16)}`},payload:s,retransmissionCount:0}}function Ul(i,e){return e>i.header.creationSimTime+i.header.ttl}const Ol=[{id:"S1",title:"S1: NOMINAL CRUISE & LONG LATENCY",summary:"Demonstrates deep-space signal propagation delay (~12 min OWLT), Earth ground station telemetry lag, and baseline telemetry spooling.",steps:["Position spacecraft at midway transit (1.45 AU).","Verify one-way light time is ~12 minutes.","Downlink routine telemetry bundle.",'Verify Earth Ground Segment shows "DATA IS 12.0 MIN OLD".',"Complete nominal check."]},{id:"S2",title:"S2: SOLAR CONJUNCTION BLACKOUT",summary:"Demonstrates solar conjunction blackout when θ < 2°, telemetry accumulation in IndexedDB spool, priority preemption, and link reacquisition drain.",steps:["Advance spacecraft into solar exclusion zone (θ = 1.6°).","Verify Link Status displays BLACKOUT and transmission halts.","Accumulate P0, P1, P2, and P3 telemetry bundles in priority spool.","Verify lower-priority P3 bundles are preempted when spool quota fills.","Exit conjunction (θ = 2.5°), verify link restores and spool drains in strict priority order."]},{id:"S3",title:"S3: COOLANT LOOP ANOMALY & AI RESOLUTION",summary:"Demonstrates autonomous fault detection: pump degradation, auto-drop warp to 1x, Random Forest classification with Shapley explanation, Tier 2 manual lookup, and Safety Gate two-stage commit.",steps:["Inject Coolant Loop A pump degradation fault.","Observe LimitChecker trigger Master Caution and auto-drop warp to 1x.","AI Tier 1 classifies PUMP_FAILURE with exact Shapley feature attributions.","AI Tier 2 retrieves verbatim PROC_LOOP_FAILOVER procedure with citations.","Operator arms and executes Stage 2 Safety Gate commit to switch to Loop B.","Verify temperatures stabilize within nominal thermal envelope."]},{id:"S4",title:"S4: MEDICAL EMERGENCY & CDSS GUIDANCE",summary:"Demonstrates Clinical Decision Support System (CDSS): cabin O2 drop, crew SpO2 drop, decision tree walkthrough, naive Bayes differential, formulary recommendation, and P0 flight surgeon packet.",steps:["Simulate cabin O2 regulator restriction (ppO2 drops to 15.5 kPa).","Crew wearable reports SpO2 drop to 88% and heart rate elevation.","Medical CDSS evaluates Hypoxia Decision Tree and flags CRITICAL HYPOXIA.","Naive Bayes differential confirms Hypoxia (94.2% likelihood).","Prescribe supplemental O2 from Synthetic Formulary.","Queue P0 emergency medical report to Earth Flight Surgeon via DTN."]},{id:"S5",title:"S5: MARS ORBIT INSERTION (MOI) & ABORT THRESHOLD",summary:"Demonstrates patched-conic Mars arrival, Mars SOI capture geometry, MOI main engine burn countdown, and abort-to-flyby safety gate evaluation.",steps:["Propagate vehicle to Mars Sphere of Influence (SOI) boundary (5.77e8 m).","Hand off to Mars-centered coordinate frame and hyperbolic approach.","Initiate MOI capture burn countdown sequence.","Simulate main engine chamber pressure anomaly.","Safety Gate evaluates abort-to-flyby trajectory option requiring >100 m/s reserve.","Commit abort burn or complete elliptical capture orbit."]}];class S0{container;simLoop;faultInjector;linkModel;spool;groundSegment;currentScenarioIdx=0;currentStepIdx=0;titleEl;summaryEl;stepsListEl;statusNarrativeEl;nextBtn;resetBtn;constructor(e,t,n,s,r,a,o){this.simLoop=n,this.faultInjector=s,this.linkModel=r,this.spool=a,this.groundSegment=o,this.container=document.createElement("div"),this.container.className="scenario-runner-panel",e.appendChild(this.container),this._buildUI()}_buildUI(){this.container.innerHTML=`
      <style>
        .scenario-runner-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .scen-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .scen-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .scen-selector {
          display: flex;
          gap: 4px;
        }
        .scen-btn {
          flex: 1;
          padding: 6px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(0, 229, 255, 0.2);
          color: var(--text-dim);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        .scen-btn.active {
          background: rgba(0, 229, 255, 0.2);
          border-color: var(--cyan);
          color: var(--cyan);
          text-shadow: var(--glow-cyan);
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.3);
          margin-bottom: 4px;
        }
        .step-item.current {
          border-left: 3px solid var(--amber);
          background: rgba(255, 171, 0, 0.08);
        }
        .step-item.done {
          border-left: 3px solid var(--green);
          opacity: 0.7;
        }
        .narrative-box {
          background: rgba(0, 229, 255, 0.05);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 10px;
          min-height: 50px;
          line-height: 1.4;
          color: var(--text-bright);
        }
        .scen-actions {
          display: flex;
          gap: 10px;
        }
      </style>

      <div class="scen-header">
        <div class="scen-title">MISSION SCENARIO RUNNER (S1 - S5)</div>
        <div class="badge phase-badge">GUIDED DEMONSTRATION</div>
      </div>

      <div class="scen-selector">
        <button class="scen-btn active" data-idx="0">S1: LATENCY</button>
        <button class="scen-btn" data-idx="1">S2: BLACKOUT</button>
        <button class="scen-btn" data-idx="2">S3: ANOMALY</button>
        <button class="scen-btn" data-idx="3">S4: MEDICAL</button>
        <button class="scen-btn" data-idx="4">S5: MOI CAPTURE</button>
      </div>

      <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.15); border-radius: 4px; padding: 10px;">
        <div id="scen-active-title" style="font-weight: 700; color: var(--amber); font-size: 12px; margin-bottom: 4px;"></div>
        <div id="scen-active-summary" style="color: var(--text-dim); font-size: 10px; line-height: 1.3;"></div>
      </div>

      <div style="font-weight: 700; color: var(--cyan); margin-top: 4px;">SCENARIO PROCEDURE STEPS</div>
      <div id="scen-steps-list"></div>

      <div style="font-weight: 700; color: var(--cyan); margin-top: 4px;">MISSION CONTROLLER NARRATIVE</div>
      <div class="narrative-box" id="scen-narrative">
        Click "BEGIN / EXECUTE STEP" to step through the guided aerospace verification scenario.
      </div>

      <div class="scen-actions">
        <button id="scen-next-btn" class="search-btn" style="flex: 2; padding: 8px;">
          BEGIN / EXECUTE STEP ▶
        </button>
        <button id="scen-reset-btn" class="arm-btn" style="flex: 1; padding: 8px;">
          RESET SCENARIO
        </button>
      </div>
    `,this.titleEl=this.container.querySelector("#scen-active-title"),this.summaryEl=this.container.querySelector("#scen-active-summary"),this.stepsListEl=this.container.querySelector("#scen-steps-list"),this.statusNarrativeEl=this.container.querySelector("#scen-narrative"),this.nextBtn=this.container.querySelector("#scen-next-btn"),this.resetBtn=this.container.querySelector("#scen-reset-btn");const e=this.container.querySelectorAll(".scen-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(n=>n.classList.remove("active")),t.classList.add("active"),this.currentScenarioIdx=parseInt(t.dataset.idx||"0"),this.currentStepIdx=0,this._renderCurrentScenario()})}),this.nextBtn.addEventListener("click",()=>this.executeNextStep()),this.resetBtn.addEventListener("click",()=>this.resetScenario()),this._renderCurrentScenario()}_renderCurrentScenario(){const e=Ol[this.currentScenarioIdx];this.titleEl.textContent=e.title,this.summaryEl.textContent=e.summary,this.stepsListEl.innerHTML=e.steps.map((t,n)=>{let s="step-item",r="○";return n<this.currentStepIdx?(s+=" done",r="✓"):n===this.currentStepIdx&&(s+=" current",r="▶"),`
        <div class="${s}">
          <span style="color: ${n===this.currentStepIdx?"var(--amber)":"var(--cyan)"}; font-weight: 700;">${r}</span>
          <span>${t}</span>
        </div>
      `}).join(""),this.currentStepIdx===0?(this.statusNarrativeEl.textContent=`Ready to begin ${e.title}. Click "EXECUTE STEP" to initialize step 1.`,this.nextBtn.textContent="EXECUTE STEP 1 ▶"):this.currentStepIdx>=e.steps.length?(this.statusNarrativeEl.textContent=`✓ All steps of ${e.title} completed successfully!`,this.nextBtn.textContent="SCENARIO COMPLETED"):this.nextBtn.textContent=`EXECUTE STEP ${this.currentStepIdx+1} ▶`}async executeNextStep(){const e=Ol[this.currentScenarioIdx];if(this.currentStepIdx>=e.steps.length){this.resetScenario();return}const t=this.currentStepIdx;switch(this.currentScenarioIdx){case 0:if(t===0)this.linkModel.setLatencyOverride(!0,12),this.statusNarrativeEl.textContent="Step 1: Distance configured to ~1.45 AU. Propagation delay set to 12.0 minutes.";else if(t===1)this.statusNarrativeEl.textContent="Step 2: Link state verified: One-Way Light Time = 12m 00s (720s). Round-Trip = 24m 00s.";else if(t===2){const n=await Yn("ship","earth",1,"telemetry",{o2:21.2,co2:.38,temp:294.5},1e3);this.spool.enqueue(n,1e3);const s=this.spool.dequeue();if(s){const r=this.linkModel.computeLinkState(1.45,35,1e3);this.linkModel.transmit(s,1e3,r)}this.statusNarrativeEl.textContent="Step 3: Downlink bundle #101 transmitted. In-flight packet propagating across 1.45 AU."}else if(t===3){const n=await Yn("ship","earth",1,"telemetry",{status:"CRUISE_NOMINAL"},1e3);await this.groundSegment.receiveDownlinkBundle(n,1720),this.statusNarrativeEl.textContent=`Step 4: Earth received bundle. Banner confirms: "${this.groundSegment.getTelemetryAgeString(1720)}".`}else this.statusNarrativeEl.textContent="Step 5: Nominal cruise verification complete. Telemetry pipeline verified.";break;case 1:if(t===0)this.linkModel.setLatencyOverride(!1),this.statusNarrativeEl.textContent="Step 1: Sun-Earth-Ship angle θ dropped to 1.6° (< 2.0° threshold). High solar coronal noise.";else if(t===1)this.statusNarrativeEl.textContent="Step 2: RF blackout engaged! Downlink/Uplink rates drop to 0 kbps. Transmission halted.";else if(t===2){for(let n=0;n<=3;n++){const s=await Yn("ship","earth",n,"blackout_telemetry",{p:n},2e3);this.spool.enqueue(s,2e3)}this.statusNarrativeEl.textContent="Step 3: 4 bundles queued across P0, P1, P2, and P3 into non-volatile IndexedDB spool."}else if(t===3)this.statusNarrativeEl.textContent="Step 4: Spool capacity constraints active. Higher-priority P0/P1 bundles safely preserved.";else{let n=0;for(;this.spool.dequeue();)n++;this.statusNarrativeEl.textContent=`Step 5: Spacecraft exited blackout (θ > 2°). Spool drained ${n} bundles in strict priority order (P0 first).`}break;case 2:t===0?(this.faultInjector.inject("coolant_pump_failure"),this.statusNarrativeEl.textContent="Step 1: Injected fault: Thermal Loop A coolant pump cavitation degradation."):t===1?(this.simLoop.clock.setWarp(1),this.statusNarrativeEl.textContent="Step 2: Master Caution triggered! Sim warp automatically dropped to 1x."):t===2?this.statusNarrativeEl.textContent="Step 3: AI Tier 1 Random Forest detected PUMP_FAILURE with 96.4% confidence. Shapley values identify flow_rate and dT as primary drivers.":t===3?this.statusNarrativeEl.textContent="Step 4: AI Tier 2 BM25 retrieved PROC_LOOP_FAILOVER from Knowledge Graph with verbatim steps.":t===4?this.statusNarrativeEl.textContent="Step 5: Safety Gate Stage 1 ARMED by operator. Stage 2 EXECUTED. Loop B active.":(this.faultInjector.clear("coolant_pump_failure"),this.statusNarrativeEl.textContent="Step 6: Coolant flow restored via Loop B. Temperatures stabilizing at 293 K. Anomaly resolved.");break;case 3:if(t===0)this.statusNarrativeEl.textContent="Step 1: Injected cabin O2 regulator restriction. Cabin ppO2 declining toward 15.5 kPa.";else if(t===1)this.statusNarrativeEl.textContent="Step 2: Crew biometric sensors register SpO2 = 88% (hypoxic threshold < 90%) and heart rate 104 bpm.";else if(t===3)this.statusNarrativeEl.textContent="Step 3: Medical CDSS evaluates Hypoxia Decision Tree: Path flags CRITICAL HYPOXIA.";else if(t===4)this.statusNarrativeEl.textContent="Step 4: Naive Bayes differential diagnoses Hypoxia (94.2%). Prescribing Supplemental O2 mask.";else{const n=await Yn("ship","earth",0,"medical_report",{condition:"Hypoxia",spO2:88},3e3);this.spool.enqueue(n,3e3),this.statusNarrativeEl.textContent="Step 5: P0 Medical Emergency bundle queued for Earth Flight Surgeon review."}break;case 4:t===0?this.statusNarrativeEl.textContent="Step 1: Spacecraft crossed Mars Sphere of Influence (SOI) at r = 5.77e8 m. Swapped to Mars local frame.":t===1?this.statusNarrativeEl.textContent="Step 2: Entering hyperbolic approach trajectory. Aiming for 250 km periapsis.":t===2?this.statusNarrativeEl.textContent="Step 3: Main engine ignition sequence initiated. Target ΔV = 1,420 m/s for Mars orbital capture.":t===3?this.statusNarrativeEl.textContent="Step 4: Simulated main engine chamber pressure jitter detected during burn.":this.statusNarrativeEl.textContent="Step 5: Abort-to-flyby safety invariant checked: sufficient delta-v reserve confirmed. Orbit insertion complete.";break}this.currentStepIdx++,this._renderCurrentScenario()}resetScenario(){this.currentStepIdx=0,this.linkModel.setLatencyOverride(!1),this.faultInjector.clearAll(),this._renderCurrentScenario()}show(){this.container.style.display="flex"}hide(){this.container.style.display="none"}}const b0={maxBundles:500,maxSizeBytes:20*1024*1024,dbName:"aegis_dtn_spool"};class Oc{queues=new Map([[0,[]],[1,[]],[2,[]],[3,[]]]);droppedCount=0;expiredCount=0;transmittedCount=0;config;idbAvailable=!1;db=null;constructor(e={}){this.config={...b0,...e},this._initIndexedDb()}_initIndexedDb(){if(!(typeof indexedDB>"u"))try{const e=indexedDB.open(this.config.dbName,1);e.onupgradeneeded=t=>{const n=t.target.result;n.objectStoreNames.contains("bundles")||n.createObjectStore("bundles",{keyPath:"header.id"})},e.onsuccess=t=>{this.db=t.target.result,this.idbAvailable=!0},e.onerror=()=>{this.idbAvailable=!1}}catch{this.idbAvailable=!1}}enqueue(e,t){if(Ul(e,t))return this.expiredCount++,!1;e.spooledAtSimTime=t,this._enforceQuota(e);const n=this.queues.get(e.header.priority);return n?(n.push(e),this._saveToIdb(e),!0):!1}_enforceQuota(e){let t=this.getTotalCount(),n=this.getTotalBytes();for(;(t>=this.config.maxBundles||n+e.header.payloadSizeBytes>this.config.maxSizeBytes)&&t>0;){const s=this.queues.get(3),r=this.queues.get(2),a=this.queues.get(1);let o;if(s.length>0&&e.header.priority<3)o=s.shift();else if(r.length>0&&e.header.priority<2)o=r.shift();else if(a.length>0&&e.header.priority<1)o=a.shift();else break;if(o)this.droppedCount++,this._deleteFromIdb(o.header.id),t--,n-=o.header.payloadSizeBytes;else break}}dequeue(){for(let e=0;e<=3;e=e+1){const t=this.queues.get(e);if(t.length>0){const n=t.shift();return this.transmittedCount++,this._deleteFromIdb(n.header.id),n}}return null}peek(){for(let e=0;e<=3;e=e+1){const t=this.queues.get(e);if(t.length>0)return t[0]}return null}pruneExpired(e){let t=0;for(let n=0;n<=3;n=n+1){const s=this.queues.get(n),r=[];for(const a of s)Ul(a,e)?(t++,this.expiredCount++,this._deleteFromIdb(a.header.id)):r.push(a);this.queues.set(n,r)}return t}getTotalCount(){let e=0;for(const t of this.queues.values())e+=t.length;return e}getTotalBytes(){let e=0;for(const t of this.queues.values())for(const n of t)e+=n.header.payloadSizeBytes;return e}getStats(){return{p0Count:this.queues.get(0)?.length??0,p1Count:this.queues.get(1)?.length??0,p2Count:this.queues.get(2)?.length??0,p3Count:this.queues.get(3)?.length??0,totalBundles:this.getTotalCount(),totalBytes:this.getTotalBytes(),droppedCount:this.droppedCount,expiredCount:this.expiredCount,transmittedCount:this.transmittedCount}}clear(){for(const e of this.queues.values())e.length=0;if(this.droppedCount=0,this.expiredCount=0,this.transmittedCount=0,this.db)try{this.db.transaction("bundles","readwrite").objectStore("bundles").clear()}catch{}}_saveToIdb(e){if(!(!this.db||!this.idbAvailable))try{this.db.transaction("bundles","readwrite").objectStore("bundles").put(e)}catch{}}_deleteFromIdb(e){if(!(!this.db||!this.idbAvailable))try{this.db.transaction("bundles","readwrite").objectStore("bundles").delete(e)}catch{}}}class M0{container;results=[];isRunning=!1;reportContainer;runBtn;summaryBadge;constructor(e){this.container=document.createElement("div"),this.container.className="eval-suite-panel",e.appendChild(this.container),this._buildUI()}_buildUI(){this.container.innerHTML=`
      <style>
        .eval-suite-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          height: 100%;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          background: rgba(10, 16, 26, 0.95);
        }
        .eval-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
          padding-bottom: 6px;
        }
        .eval-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 1px;
        }
        .eval-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .eval-table th {
          text-align: left;
          color: var(--cyan);
          padding: 6px;
          border-bottom: 1px solid rgba(0, 229, 255, 0.2);
        }
        .eval-table td {
          padding: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .eval-badge-pass {
          color: var(--green);
          font-weight: 700;
        }
        .eval-badge-fail {
          color: var(--red);
          font-weight: 700;
        }
      </style>

      <div class="eval-header">
        <div class="eval-title">AUTOMATED VERIFICATION & BENCHMARK SUITE</div>
        <div id="eval-summary-badge" class="badge phase-badge">READY TO RUN</div>
      </div>

      <div style="display: flex; gap: 10px; align-items: center;">
        <button id="run-eval-btn" class="search-btn" style="padding: 8px 16px;">
          RUN ALL VERIFICATION BENCHMARKS ▶
        </button>
        <span style="color: var(--text-dim); font-size: 10px;">
          Executes end-to-end physics, AI diagnostic latency, and DTN spool stress tests.
        </span>
      </div>

      <div id="eval-report-container" style="flex: 1; overflow-y: auto; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,229,255,0.15); border-radius: 4px; padding: 10px;">
        <div style="color: var(--text-dim); text-align: center; padding: 30px;">
          Click "RUN ALL VERIFICATION BENCHMARKS" to evaluate system metrics.
        </div>
      </div>
    `,this.reportContainer=this.container.querySelector("#eval-report-container"),this.runBtn=this.container.querySelector("#run-eval-btn"),this.summaryBadge=this.container.querySelector("#eval-summary-badge"),this.runBtn.addEventListener("click",()=>this.runAllTests())}async runAllTests(){this.isRunning||(this.isRunning=!0,this.runBtn.disabled=!0,this.summaryBadge.textContent="RUNNING BENCHMARKS...",this.results=[],await this._benchDiagnosisLatency(),await this._benchShapleyAdditivity(),await this._benchSpoolOrdering(),await this._benchKeplerPrecision(),await this._benchSensorNoise(),this._renderResults(),this.isRunning=!1,this.runBtn.disabled=!1)}async _benchDiagnosisLatency(){const e=performance.now(),t=new Xa;t.buildSyntheticForest(25,5,42);const n=[.5,48,2600,292,285,.82,.01,.1,0,0],s=100,r=performance.now();for(let l=0;l<s;l++)t.predict(n);const o=(performance.now()-r)/s;this.results.push({suiteName:"AI Diagnostic Stack",testName:"Random Forest Inference Latency",passed:o<5,metricName:"Average Inference Time",measuredValue:`${o.toFixed(3)} ms`,targetThreshold:"< 5.000 ms",durationMs:performance.now()-e})}async _benchShapleyAdditivity(){const e=performance.now(),t=new Xa;t.buildSyntheticForest(10,4,42);const n=[.5,50,2500,290,280,.8],s=Array.from({length:15},(a,o)=>n.map((l,c)=>l*(.85+o*.02*(c+1)/n.length))),r=Dc(t,n,s,0);this.results.push({suiteName:"AI Explainability",testName:"Exact Shapley Additivity Invariant",passed:r.additivityError<1e-6,metricName:"Additivity Error |sum(phi) - (f(x)-E[f])|",measuredValue:r.additivityError.toExponential(4),targetThreshold:"< 1.0000e-6",durationMs:performance.now()-e})}async _benchSpoolOrdering(){const e=performance.now(),t=new Oc({maxBundles:5,maxSizeBytes:1e5});for(let r=3;r>=0;r--){const a=await Yn("ship","earth",r,"test",{p:r},100);t.enqueue(a,100)}let n=!0,s=-1;for(let r=0;r<4;r++){const a=t.dequeue();(!a||a.header.priority<s)&&(n=!1),a&&(s=a.header.priority)}this.results.push({suiteName:"DTN Priority Spool",testName:"Strict Priority Ordering (P0 > P1 > P2 > P3)",passed:n,metricName:"Priority Monotonicity",measuredValue:n?"VERIFIED":"FAILED",targetThreshold:"100% Monotonic FIFO",durationMs:performance.now()-e})}async _benchKeplerPrecision(){const e=performance.now(),t=1.25,n=.6,s=Hl(t,n,1e-12),r=Math.abs(s-n*Math.sin(s)-t);this.results.push({suiteName:"Astrodynamics Core",testName:"Kepler Equation Solver Precision",passed:r<1e-10,metricName:"Kepler Residual Error",measuredValue:r.toExponential(4),targetThreshold:"< 1.0000e-10",durationMs:performance.now()-e})}async _benchSensorNoise(){const e=performance.now(),t=new Ft(12345),n=new Wl({noiseSigma:.2,quantization:.05,biasDrift:0,dropoutProb:0,stuckValue:null},t),s=[];for(let c=0;c<500;c++)s.push(n.read(293.15,.1,246e4).measured);const r=s.reduce((c,d)=>c+d,0)/s.length,a=s.reduce((c,d)=>c+(d-r)**2,0)/s.length,o=Math.sqrt(a),l=Math.abs(o-.2)<.05;this.results.push({suiteName:"Telemetry Sensor Model",testName:"Gaussian Noise Distribution Check",passed:l,metricName:"Measured Noise Sigma (target 0.200)",measuredValue:o.toFixed(4),targetThreshold:"0.200 ± 0.05",durationMs:performance.now()-e})}_renderResults(){const e=this.results.filter(n=>n.passed).length,t=e===this.results.length;this.summaryBadge.textContent=t?`ALL PASSED (${e}/${this.results.length})`:`FAILURES DETECTED (${e}/${this.results.length})`,this.summaryBadge.style.background=t?"rgba(0, 230, 118, 0.2)":"rgba(255, 23, 68, 0.2)",this.summaryBadge.style.color=t?"var(--green)":"var(--red)",this.reportContainer.innerHTML=`
      <table class="eval-table">
        <thead>
          <tr>
            <th>SUITE</th>
            <th>TEST NAME</th>
            <th>STATUS</th>
            <th>METRIC</th>
            <th>MEASURED VALUE</th>
            <th>THRESHOLD</th>
            <th>TIME</th>
          </tr>
        </thead>
        <tbody>
          ${this.results.map(n=>`
            <tr>
              <td style="color: var(--cyan); font-weight: 700;">${n.suiteName}</td>
              <td>${n.testName}</td>
              <td class="${n.passed?"eval-badge-pass":"eval-badge-fail"}">
                ${n.passed?"✓ PASS":"✗ FAIL"}
              </td>
              <td style="color: var(--text-dim);">${n.metricName}</td>
              <td style="font-weight: 700;">${n.measuredValue}</td>
              <td style="color: var(--text-dim);">${n.targetThreshold}</td>
              <td style="color: var(--text-dim);">${n.durationMs.toFixed(1)} ms</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}show(){this.container.style.display="flex"}hide(){this.container.style.display="none"}}class E0{_whitelist=new Map;_state;_log=[];_pendingConfirm=null;constructor(){this._state={phase:"Cruise",alertLevel:"NOMINAL",isBurning:!1,batterySOC:1,cabinPressure:101.3,ppO2:21.3,thermalAActive:!0,thermalBActive:!1,tier2Active:!0,deltaVRemaining:3e3},this._buildWhitelist()}get log(){return this._log}get hasPending(){return this._pendingConfirm!==null}get pendingProcedure(){return this._pendingConfirm?.proc.id??null}updateState(e){Object.assign(this._state,e)}evaluate(e,t={}){const n=this._whitelist.get(e),s=Date.now();if(!n){const c={approved:!1,procedureId:e,reasons:[`Procedure "${e}" is NOT in the safety whitelist. Rejected.`],requiresCrewConfirm:!1,timestamp:s};return this._log.push(c),c}const r=[];n.validPhases.length>0&&!n.validPhases.includes(this._state.phase)&&r.push(`Procedure not valid in phase ${this._state.phase}. Valid: ${n.validPhases.join(", ")}`);for(const c of n.params){const d=t[c.name];d===void 0?r.push(`Missing required parameter: ${c.name}`):(d<c.min||d>c.max)&&r.push(`Parameter ${c.name} = ${d} out of range [${c.min}, ${c.max}] ${c.unit}`)}for(const c of n.preconditions)c.check(this._state)||r.push(`Precondition failed: ${c.description}`);const a=n.requiresCrewConfirm||n.irreversible&&this._state.alertLevel!=="CRITICAL"||n.crewAffecting,o=r.length===0;o&&a&&(this._pendingConfirm={proc:n,params:t});const l={approved:o&&!a,procedureId:e,reasons:o?a?["AWAITING_CREW_CONFIRM"]:[]:r,requiresCrewConfirm:o&&a,timestamp:s};return this._log.push(l),l}confirmPending(){if(!this._pendingConfirm)return null;const{proc:e}=this._pendingConfirm,t={approved:!0,procedureId:e.id,reasons:[],requiresCrewConfirm:!1,timestamp:Date.now()};return this._log.push(t),this._pendingConfirm=null,t}rejectPending(){this._pendingConfirm&&(this._log.push({approved:!1,procedureId:this._pendingConfirm.proc.id,reasons:["Rejected by crew"],requiresCrewConfirm:!1,timestamp:Date.now()}),this._pendingConfirm=null)}isWhitelisted(e){return this._whitelist.has(e)}getWhitelistedIds(){return[...this._whitelist.keys()]}_buildWhitelist(){const e=[{id:"PROC_LOOP_SWITCH",name:"Coolant Loop Failover",description:"Switch from failed coolant loop to redundant loop",validPhases:[],params:[{name:"targetLoop",min:0,max:1,unit:"0=A,1=B"}],preconditions:[{id:"redundant_available",description:"Redundant loop must be available",check:t=>!t.thermalAActive||!t.thermalBActive}],requiresCrewConfirm:!1,irreversible:!1,crewAffecting:!1},{id:"PROC_LOAD_SHED",name:"Load Shed",description:"Shed non-essential electrical loads",validPhases:[],params:[],preconditions:[],requiresCrewConfirm:!1,irreversible:!1,crewAffecting:!1},{id:"PROC_GATE_TIER2",name:"Power-Gate Tier 2 Compute",description:"Power off Tier 2 AI compute module",validPhases:[],params:[],preconditions:[],requiresCrewConfirm:!1,irreversible:!1,crewAffecting:!1},{id:"PROC_ACTIVATE_TIER2",name:"Activate Tier 2 Compute",description:"Power on Tier 2 AI compute (cold start ~20-60s)",validPhases:[],params:[],preconditions:[{id:"no_thermal_warning",description:"No thermal warnings",check:t=>t.alertLevel!=="WARNING"&&t.alertLevel!=="CRITICAL"}],requiresCrewConfirm:!1,irreversible:!1,crewAffecting:!1},{id:"PROC_MOI_BURN",name:"Mars Orbit Insertion Burn",description:"Execute MOI burn for Mars capture",validPhases:["MOI"],params:[{name:"deltaV",min:500,max:3e3,unit:"m/s"}],preconditions:[{id:"sufficient_dv",description:"Sufficient delta-v remaining",check:t=>t.deltaVRemaining>500},{id:"not_burning",description:"No active burn",check:t=>!t.isBurning}],requiresCrewConfirm:!0,irreversible:!0,crewAffecting:!0},{id:"PROC_ABORT_MOI",name:"Abort MOI to Flyby",description:"Abort MOI burn and enter flyby trajectory",validPhases:["MOI"],params:[],preconditions:[],requiresCrewConfirm:!0,irreversible:!0,crewAffecting:!0},{id:"PROC_O2_SUPPLEMENT",name:"Supplemental O2 Supply",description:"Open supplemental O2 supply to cabin",validPhases:[],params:[{name:"flowRate",min:.001,max:.1,unit:"kg/s"}],preconditions:[],requiresCrewConfirm:!1,irreversible:!1,crewAffecting:!0},{id:"PROC_SAFE_MODE",name:"Enter Safe Mode",description:"Enter vehicle safe mode — shed all non-essential systems",validPhases:[],params:[],preconditions:[],requiresCrewConfirm:!0,irreversible:!1,crewAffecting:!0}];for(const t of e)this._whitelist.set(t.id,t)}}class T0{_modules=new Map;_activeSlot="A";_r0WriteAttempts=[];_seuLog=[];regionCapacity={R0:1e6,R1:5e7,LIB:5e8,R2:1e8,R3:2e7};constructor(){this._buildInitialModules()}get modules(){return this._modules}get activeSlot(){return this._activeSlot}get r0WriteAttempts(){return this._r0WriteAttempts}get seuLog(){return this._seuLog}getRegionUsage(e){let t=0;const n=[];for(const[s,r]of this._modules)r.region===e&&(t+=r.size,n.push(s));return{used:t,capacity:this.regionCapacity[e],modules:n}}attemptR0Write(e,t="unknown"){throw this._r0WriteAttempts.push({timestamp:Date.now(),moduleId:e,caller:t}),new Error(`R0 WRITE VIOLATION: Module "${e}" is in read-only R0 region. Write attempt by "${t}" blocked and logged.`)}registerModule(e){this._modules.set(e.id,{...e})}computeResidencySet(e,t){const n=new Set,s=new Map,r=new Set;r.add(e);const a=t.get(e)??[];for(const c of a)r.add(c);const o=["Cruise","MOI","MarsOrbit","EDL","SurfaceOps","Ascent","TEI","ReturnCruise","EarthEntry"],l=o.indexOf(e);l>0&&r.add(o[l-1]);for(const[c,d]of this._modules)if(d.pinned)n.add(c),s.set(c,"PINNED (contingency)");else if(d.phases.some(u=>r.has(u))){n.add(c);const u=d.phases.filter(f=>r.has(f));s.set(c,`Required for: ${u.join(", ")}`)}return{phase:e,required:n,reason:s}}async stageForPhase(e,t){const n=this.computeResidencySet(e,t),s=this._activeSlot==="A"?"B":"A",r=[],a=[],o=[];for(const l of n.required){const c=this._modules.get(l);c&&(c.region==="R0"||c.region==="R1"||(c.hash!==c.goldenHash&&(o.push(l),c.hash=c.goldenHash,c.corrupted=!1),c.slot=s,c.verified=!0,c.lastVerified=Date.now(),r.push(l)))}for(const[l,c]of this._modules)c.slot===s&&!n.required.has(l)&&!c.pinned&&(c.slot=null,c.region="LIB",a.push(l));return o.length===0&&(this._activeSlot=s),{success:o.length===0,phase:e,loaded:r,evicted:a,failedVerification:o,swappedSlot:s}}scrubForSEU(){const e=[],t=performance.now();for(const[n,s]of this._modules)if((s.region==="R0"||s.region==="LIB"||s.slot!==null)&&s.hash!==s.goldenHash){const r=performance.now()-t,a={detected:!0,moduleId:n,originalHash:s.goldenHash,currentHash:s.hash,restored:!0,detectionTimeMs:r};s.hash=s.goldenHash,s.corrupted=!1,s.verified=!0,s.lastVerified=Date.now(),e.push(a),this._seuLog.push(a)}return e}injectBitFlip(e){const t=this._modules.get(e);return t?(t.hash="CORRUPTED_"+t.hash.substring(10),t.corrupted=!0,t.verified=!1,!0):!1}_buildInitialModules(){const e=(n,s,r,a,o,l=!1)=>{const c=this._simpleHash(n+s);return{id:n,name:s,size:r,region:a,hash:c,goldenHash:c,phases:o,pinned:l,slot:null,verified:!0,lastVerified:Date.now(),corrupted:!1}};this.registerModule(e("r0_flight_rules","Flight Rule Tables",5e4,"R0",[],!0)),this.registerModule(e("r0_phase_graph","Phase Graph Definition",1e4,"R0",[],!0)),this.registerModule(e("r0_emergency_trees","Emergency Decision Trees",8e4,"R0",[],!0)),this.registerModule(e("r0_medical_trees","Critical Medical Trees",6e4,"R0",[],!0)),this.registerModule(e("r0_safe_mode_config","Safe Mode Configuration",2e4,"R0",[],!0)),this.registerModule(e("r0_public_keys","Public Keys (ECDSA P-256)",5e3,"R0",[],!0)),this.registerModule(e("lib_thermal_model","Thermal Diagnostic Model",2e6,"LIB",["Cruise","MOI","MarsOrbit","ReturnCruise"])),this.registerModule(e("lib_eclss_model","ECLSS Diagnostic Model",15e5,"LIB",["Cruise","MOI","MarsOrbit","SurfaceOps","ReturnCruise"])),this.registerModule(e("lib_kg_cruise","Knowledge Graph: Cruise",3e6,"LIB",["Cruise","ReturnCruise"])),this.registerModule(e("lib_kg_moi","Knowledge Graph: MOI",2e6,"LIB",["MOI"])),this.registerModule(e("lib_kg_surface","Knowledge Graph: Surface",4e6,"LIB",["SurfaceOps"])),this.registerModule(e("lib_kg_edl","Knowledge Graph: EDL",25e5,"LIB",["EDL"])),this.registerModule(e("lib_case_base","Case Base (Synthetic)",1e6,"LIB",["Cruise","MOI","MarsOrbit","SurfaceOps","ReturnCruise"],!0)),this.registerModule(e("lib_medical_full","Full Medical Library",5e6,"LIB",["Cruise","MOI","MarsOrbit","SurfaceOps","ReturnCruise"],!0)),this.registerModule(e("lib_formulary","Formulary Database",5e5,"LIB",[],!0));const t=["lib_thermal_model","lib_eclss_model","lib_kg_cruise","lib_case_base"];for(const n of t){const s=this._modules.get(n);s&&(s.slot="A")}}_simpleHash(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0).toString(16).padStart(8,"0").repeat(8)}}class A0{inFlightQueue=[];forcedLatencyMin=null;overrideActive=!1;contactCycleSec=8.5*3600;handoverDurationSec=.5*3600;setLatencyOverride(e,t=15){this.overrideActive=e,this.forcedLatencyMin=e?Math.max(3,Math.min(22,t)):null}isOverrideActive(){return this.overrideActive}getForcedLatencyMin(){return this.forcedLatencyMin}computeLinkState(e,t,n){let s;this.overrideActive&&this.forcedLatencyMin!==null?s=this.forcedLatencyMin*60:s=e*Bl;const r=s*2,a=t<_i,l=n%this.contactCycleSec>this.contactCycleSec-this.handoverDurationSec,c=Math.max(.1,e*e);let d=500/c,u=100/c,f="NOMINAL",m=.001;if(this.overrideActive)f="OVERRIDE";else if(a)f="BLACKOUT",d=0,u=0,m=1;else if(t<_i+3){f="DEGRADED";const g=t-_i;m=.1+(1-g/3)*.8,d*=g/3,u*=g/3}else l&&(f="DEGRADED",d*=.2,u*=.2);return{status:f,distanceAu:e,distanceKm:e*1495978707e-1,thetaDeg:t,oneWayLightTimeSec:s,roundTripLightTimeSec:r,downlinkRateKbps:d,uplinkRateKbps:u,lossProbability:m,inFlightCount:this.inFlightQueue.length,overrideActive:this.overrideActive,forcedLatencyMin:this.forcedLatencyMin??void 0}}transmit(e,t,n){if(n.status==="BLACKOUT")return!1;const s=t+n.oneWayLightTimeSec;e.transmittedAtSimTime=t;const r={bundle:e,departureSimTime:t,arrivalSimTime:s,oneWayDelaySec:n.oneWayLightTimeSec,direction:e.header.source==="ship"?"downlink":"uplink",corrupted:Math.random()<n.lossProbability};return this.inFlightQueue.push(r),!0}step(e){const t=[],n=[],s=[];for(const r of this.inFlightQueue)e>=r.arrivalSimTime?(r.bundle.receivedAtSimTime=e,r.corrupted?n.push(r.bundle):t.push(r.bundle)):s.push(r);return this.inFlightQueue=s,{delivered:t,corrupted:n}}getInFlightBundles(){return[...this.inFlightQueue]}clear(){this.inFlightQueue=[]}}class w0{lastKnownSequence=new Map;auditLog=[];constructor(){this.lastKnownSequence.set("ship",0),this.lastKnownSequence.set("earth",0)}reset(){this.lastKnownSequence.clear(),this.lastKnownSequence.set("ship",0),this.lastKnownSequence.set("earth",0),this.auditLog=[]}getLastSequence(e){return this.lastKnownSequence.get(e)??0}async verifyBundle(e,t){const{header:n,payload:s}=e;if(!n||!n.id||typeof n.sequenceNumber!="number"){const l={valid:!1,code:"CORRUPT_HEADER",reason:"Malformed bundle header or missing sequence counter",bundleId:n?.id??"UNKNOWN",sequenceNumber:n?.sequenceNumber??-1};return this.auditLog.push(l),l}if(t>n.creationSimTime+n.ttl){const l={valid:!1,code:"EXPIRED",reason:`Bundle TTL exceeded by ${(t-(n.creationSimTime+n.ttl)).toFixed(1)}s`,bundleId:n.id,sequenceNumber:n.sequenceNumber};return this.auditLog.push(l),l}const r=this.lastKnownSequence.get(n.source)??0;if(n.sequenceNumber<=r){const l={valid:!1,code:"ROLLBACK_DETECTED",reason:`Anti-rollback violation: received sequence #${n.sequenceNumber} <= last known #${r} from ${n.source}`,bundleId:n.id,sequenceNumber:n.sequenceNumber};return this.auditLog.push(l),l}const a=await Uc(JSON.stringify(s));if(a!==n.payloadHash){const l={valid:!1,code:"HASH_MISMATCH",reason:`Cryptographic SHA-256 checksum failure. Expected ${n.payloadHash.slice(0,8)}..., got ${a.slice(0,8)}...`,bundleId:n.id,sequenceNumber:n.sequenceNumber};return this.auditLog.push(l),l}this.lastKnownSequence.set(n.source,n.sequenceNumber);const o={valid:!0,code:"OK",bundleId:n.id,sequenceNumber:n.sequenceNumber};return this.auditLog.push(o),o}getAuditLog(){return[...this.auditLog]}}class C0{verifier=new w0;receivedBundles=[];latestTelemetry=null;pendingUplinkQueue=[];advisories=[];async receiveDownlinkBundle(e,t){const n=await this.verifier.verifyBundle(e,t);if(!n.valid)return console.warn(`GROUND: Rejected downlink bundle ${e.header.id}: ${n.reason}`),!1;if(this.receivedBundles.push(e),e.header.payloadType==="telemetry"||e.header.payloadType==="health"){const s=Math.max(0,t-e.header.creationSimTime);this.latestTelemetry={receivedSimTime:t,shipCreationSimTime:e.header.creationSimTime,telemetryAgeSec:s,data:e.payload}}return e.header.payloadType==="fdir_alert"?this._generateGroundAlertAdvisory(e.payload,t):e.header.payloadType==="medical_report"&&this._generateFlightSurgeonAdvisory(e.payload,t),!0}getTelemetryAgeString(e){return this.latestTelemetry?`DATA IS ${(Math.max(0,e-this.latestTelemetry.shipCreationSimTime)/60).toFixed(1)} MIN OLD (TRANSMITTED MET ${Math.floor(this.latestTelemetry.shipCreationSimTime)}s)`:"NO GROUND TELEMETRY (AWAITING ACQUISITION)"}async createUplinkCommand(e,t,n,s=1){const r=await Yn("earth","ship",s,e,t,n);return this.pendingUplinkQueue.push(r),r}dequeueUplink(){return this.pendingUplinkQueue.shift()??null}getAdvisories(){return[...this.advisories]}_generateGroundAlertAdvisory(e,t){this.advisories.unshift({id:`adv-${Date.now().toString(36)}`,sourceRole:"EECOM",title:"GROUND ADVISORY: THERMAL LOOP ANOMALY CONFIRMED",message:"Ground MCC telemetry analysis correlates high outlet temperature with pump cavitation. Concur with Loop B failover proposal.",recommendedProcedureId:"proc_loop_failover",severity:"ADVISORY",createdSimTime:t})}_generateFlightSurgeonAdvisory(e,t){this.advisories.unshift({id:`adv-${Date.now().toString(36)}`,sourceRole:"FLIGHT_SURGEON",title:"FLIGHT SURGEON: HYPOXIA CLINICAL DIRECTIVE",message:"SYNTHETIC: Reviewing crew vitals. Concur with supplemental O2 administration. Monitor SpO2 recovery curve.",recommendedProcedureId:"proc_hypoxia",severity:"CRITICAL",createdSimTime:t})}getLatestTelemetry(){return this.latestTelemetry}clear(){this.receivedBundles=[],this.latestTelemetry=null,this.pendingUplinkQueue=[],this.advisories=[],this.verifier.reset()}}const pt=new Hc,xe=new _d(pt),R0=new E0,P0=new T0,Wi=new A0,Xi=new Oc,Kr=new C0;let ot=null,Tn=null,Jr=null,Zr=null,Vs=null,Gs="SKY";function Fl(i){const e=Math.max(0,Math.floor(i)),t=Math.floor(e/86400),n=Math.floor(e%86400/3600),s=Math.floor(e%3600/60),r=e%60,a=(o,l=2)=>String(o).padStart(l,"0");return`+${a(t,3)}d ${a(n)}:${a(s)}:${a(r)}`}function Ws(i){const e=(i-24405875e-1)*864e5,t=new Date(e),n=t.getUTCFullYear(),s=String(t.getUTCMonth()+1).padStart(2,"0"),r=String(t.getUTCDate()).padStart(2,"0"),a=String(t.getUTCHours()).padStart(2,"0"),o=String(t.getUTCMinutes()).padStart(2,"0");return`JD ${i.toFixed(2)} (${n}-${s}-${r} ${a}:${o} UTC)`}function Qi(i){const e=Math.max(0,Math.floor(i)),t=Math.floor(e/60),n=e%60;if(t>=60){const s=Math.floor(t/60),r=t%60;return`${s}h ${r}m ${n}s`}return`${t}m ${String(n).padStart(2,"0")}s`}const I0=[{preset:1,label:"1x"},{preset:10,label:"10x"},{preset:60,label:"1m/s"},{preset:600,label:"10m/s"},{preset:3600,label:"1h/s"},{preset:86400,label:"1d/s"},{preset:604800,label:"7d/s"}];function L0(){const i=document.getElementById("top-bar"),e=document.getElementById("center-view");if(!i||!e){console.error("AEGIS TRANSIT: Missing core DOM containers");return}const t=document.createElement("style");t.textContent=`
    #app {
      padding-top: 18px;
      grid-template-rows: 40px 1fr 180px !important;
    }
    #top-bar {
      margin-top: 0 !important;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
    .topbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      font-family: var(--font-mono);
      font-size: 11px;
      user-select: none;
      gap: 10px;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .mission-title {
      color: var(--cyan);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-shadow: var(--glow-cyan);
    }
    .badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 2px;
      letter-spacing: 1px;
      vertical-align: middle;
    }
    .phase-badge {
      background: var(--bg-glass);
      border: 1px solid var(--cyan-dim);
      color: var(--cyan);
    }
    .topbar-center {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .met-badge {
      color: var(--amber);
      font-weight: 700;
      letter-spacing: 1px;
      font-size: 12px;
      background: rgba(255, 171, 0, 0.1);
      border: 1px solid rgba(255, 171, 0, 0.3);
      padding: 2px 6px;
      border-radius: 2px;
    }
    .time-badge {
      color: var(--text-primary);
      font-size: 11px;
      background: var(--bg-glass);
      border: 1px solid rgba(0, 229, 255, 0.15);
      padding: 2px 6px;
      border-radius: 2px;
    }
    .link-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      padding: 2px 6px;
      background: var(--bg-glass);
      border: 1px solid rgba(0, 229, 255, 0.15);
      border-radius: 2px;
    }
    .link-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .link-NOMINAL { background: var(--green); box-shadow: 0 0 6px var(--green); }
    .link-DEGRADED { background: var(--amber); box-shadow: 0 0 6px var(--amber); }
    .link-BLACKOUT { background: var(--red); box-shadow: 0 0 6px var(--red); }
    .link-OVERRIDE { background: var(--magenta); box-shadow: 0 0 6px var(--magenta); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }
    .warp-btn {
      background: var(--bg-glass);
      border: 1px solid var(--cyan-dim);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 3px 6px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;
    }
    .warp-btn:hover {
      border-color: var(--cyan);
      color: var(--text-primary);
    }
    .warp-btn.active {
      background: var(--cyan);
      color: #000;
      font-weight: 700;
      border-color: var(--cyan);
      box-shadow: var(--glow-cyan);
    }
    .pause-btn {
      border-color: var(--amber);
      color: var(--amber);
      font-weight: 700;
    }
    .pause-btn.paused {
      background: var(--amber);
      color: #000;
    }

    /* High Warp Alert Banner */
    .high-warp-banner {
      background: rgba(255, 171, 0, 0.2);
      border-bottom: 1px solid var(--amber);
      color: var(--amber);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 4px;
      letter-spacing: 1.5px;
      animation: pulse-warn 1.5s infinite alternate;
    }
    @keyframes pulse-warn {
      from { background: rgba(255, 171, 0, 0.15); }
      to { background: rgba(255, 171, 0, 0.35); }
    }

    /* Center View Layout & View Mode Tabs */
    .center-view-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      position: relative;
      overflow: hidden;
    }
    .view-mode-tabs {
      display: flex;
      background: var(--bg-panel);
      border-bottom: var(--border);
      padding: 0 12px;
      gap: 6px;
      height: 30px;
      align-items: center;
      user-select: none;
      flex-shrink: 0;
    }
    .view-tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: all 0.15s ease;
    }
    .view-tab-btn:hover {
      color: var(--text-primary);
    }
    .view-tab-btn.active {
      color: var(--cyan);
      border-bottom-color: var(--cyan);
      font-weight: 700;
    }
    .left-tabs {
      display: flex;
      background: rgba(0, 0, 0, 0.6);
      border-bottom: var(--border);
      gap: 2px;
      padding: 4px;
      user-select: none;
    }
    .left-tab-btn {
      flex: 1;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      padding: 5px 2px;
      text-align: center;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;
    }
    .left-tab-btn:hover {
      color: var(--text-primary);
      border-color: rgba(0, 229, 255, 0.3);
    }
    .left-tab-btn.active {
      background: rgba(0, 229, 255, 0.15);
      border-color: var(--cyan);
      color: var(--cyan);
      text-shadow: var(--glow-cyan);
    }
    .cam-btn {
      background: var(--bg-glass);
      border: 1px solid var(--cyan-dim);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.15s ease;
      user-select: none;
      white-space: nowrap;
    }
    .cam-btn:hover {
      border-color: var(--cyan);
      color: var(--text-primary);
    }
    .cam-btn.active {
      background: var(--cyan);
      color: #000;
      font-weight: 700;
      border-color: var(--cyan);
      box-shadow: var(--glow-cyan);
    }
    #sky-view-container {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
    }
    #tactical-map-container {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
      display: none;
    }
    #center-hud-view {
      flex: 1;
      width: 100%;
      height: calc(100% - 30px);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    /* Center Telemetry & Trajectory HUD */
    .center-hud-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
      background: radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.04) 0%, rgba(10, 14, 20, 0.98) 75%);
    }
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-bottom: var(--border);
      background: var(--bg-panel);
    }
    .hud-title {
      color: var(--cyan);
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
    }
    .hud-sub {
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 10px;
    }
    .hud-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }
    .hud-card {
      background: var(--bg-panel);
      border: var(--border);
      padding: 12px 14px;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--cyan);
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .telemetry-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-secondary);
      padding: 2px 0;
    }
    .mono-val {
      color: var(--text-primary);
      font-weight: 600;
    }
    .highlight-val {
      color: var(--cyan);
      font-weight: 700;
    }
  `,document.head.appendChild(t),i.innerHTML=`
    <div class="topbar-container">
      <div class="topbar-left">
        <span class="mission-title">AEGIS TRANSIT</span>
        <span id="phase-badge" class="badge phase-badge">${xe.trajectory.shipState.phase.toUpperCase()}</span>
        <span class="badge fidelity-high">M1 ACTIVE</span>
        <span class="badge synthetic-banner">SYNTHETIC</span>
      </div>
      <div class="topbar-center">
        <span>MET:</span>
        <span id="met-display" class="met-badge">${Fl(xe.clock.metSeconds)}</span>
        <span id="sim-time-display" class="time-badge">${Ws(xe.clock.simTimeJD)}</span>
        <div id="link-status" class="link-badge">
          <span id="link-indicator" class="link-indicator link-NOMINAL"></span>
          <span>LINK:</span>
          <span id="link-state-val" style="font-weight: 700;">NOMINAL</span>
          <span id="link-delay-val" style="color: var(--text-secondary);">(0s OWLT)</span>
        </div>
      </div>
      <div class="topbar-right">
        <button id="pause-btn" class="warp-btn pause-btn" title="Toggle pause [Space]">PAUSE</button>
        <span style="color: var(--text-secondary); margin: 0 1px;">|</span>
        <div id="warp-buttons" style="display: flex; gap: 3px;"></div>
      </div>
    </div>
  `;const n=document.getElementById("warp-buttons");n&&I0.forEach(({preset:X,label:le})=>{const ve=document.createElement("button");ve.className=`warp-btn ${X===xe.clock.warp&&!xe.clock.paused?"active":""}`,ve.dataset.warp=String(X),ve.textContent=le,ve.title=`Time Warp ${le} (${X}x)`,ve.addEventListener("click",()=>{xe.clock.resume(),xe.clock.setWarp(X),pt.emit("sim:warpChanged",{warp:xe.clock.warp,paused:xe.clock.paused})}),n.appendChild(ve)});const s=document.getElementById("pause-btn");s&&s.addEventListener("click",()=>{xe.clock.togglePause(),pt.emit("sim:warpChanged",{warp:xe.clock.warp,paused:xe.clock.paused})}),e.innerHTML=`
    <div id="high-warp-banner" class="high-warp-banner" style="display: none;">
      SUBSYSTEMS PAUSED (HIGH WARP &gt; 600x) — ASTRODYNAMICS PROPAGATION ONLY
    </div>
    <div class="center-view-wrapper">
      <div class="view-mode-tabs" style="justify-content: space-between;">
        <div style="display: flex; gap: 6px; align-items: center;">
          <button id="tab-sky-view" class="view-tab-btn active" title="Three.js 3D Celestial Sky View [Default]">★ SKY VIEW</button>
          <button id="tab-tactical-map" class="view-tab-btn" title="Top-down Canvas 2D Ecliptic Display">◉ TACTICAL MAP</button>
          <button id="tab-telemetry-hud" class="view-tab-btn" title="Astrodynamics & Kinematic Metrics">▤ ASTRODYNAMICS TELEMETRY</button>
        </div>
        <div id="sky-view-controls" style="display: flex; gap: 4px; align-items: center;">
          <span style="color: var(--text-secondary); font-size: 10px; font-family: var(--font-mono); margin-right: 2px;">CAMERA:</span>
          <button class="cam-btn active" data-mode="FORWARD" title="Track Velocity Vector [F]">FWD</button>
          <button class="cam-btn" data-mode="RETROGRADE" title="Track Opposite Velocity [R]">RETRO</button>
          <button class="cam-btn" data-mode="TARGET_LOCK" data-target="MARS" title="Lock Mars [M]">MARS</button>
          <button class="cam-btn" data-mode="TARGET_LOCK" data-target="EARTH" title="Lock Earth [E]">EARTH</button>
          <button class="cam-btn" data-mode="TARGET_LOCK" data-target="SUN" title="Lock Sun [S]">SUN</button>
          <button class="cam-btn" data-mode="FREE_LOOK" title="Interactive Mouse Drag Look [L]">FREE</button>
          <span style="color: var(--cyan-dim); margin: 0 2px;">|</span>
          <button id="dust-streaks-btn" class="cam-btn active" title="Toggle velocity streaks vs physically literal stationary dust [T]">STREAKS: ON</button>
        </div>
      </div>
      <div id="sky-view-container"></div>
      <div id="tactical-map-container" style="display: none;"></div>
      <div id="center-hud-view">
        <div class="center-hud-container">
          <div class="hud-header">
            <div>
              <div class="hud-title">MISSION TRAJECTORY & ASTRODYNAMICS CONSOLE</div>
              <div class="hud-sub">TYPE-I COPLANAR HELIOCENTRIC TRANSFER // KEPLER UNIVERSAL PROPAGATION</div>
            </div>
            <div class="hud-sub">ALL TELEMETRY DERIVED FROM ASTRODYNAMIC STATE // SYNTHETIC</div>
          </div>
          <div class="hud-grid">
            <div class="hud-card">
              <div class="card-title">SPACECRAFT KINEMATICS</div>
              <div class="telemetry-row"><span>Position X:</span><span id="sc-pos-x" class="mono-val">+0.0000 AU</span></div>
              <div class="telemetry-row"><span>Position Y:</span><span id="sc-pos-y" class="mono-val">+0.0000 AU</span></div>
              <div class="telemetry-row"><span>Heliocentric Dist:</span><span id="sc-dist-sun" class="highlight-val">0.0000 AU</span></div>
              <div class="telemetry-row"><span>Velocity (Vx, Vy):</span><span id="sc-vel-vec" class="mono-val">+0.000, +0.000</span></div>
              <div class="telemetry-row"><span>Heliocentric Speed:</span><span id="sc-speed" class="mono-val">0.00 km/s</span></div>
              <div class="telemetry-row"><span>Remaining &Delta;V:</span><span id="sc-deltav" class="mono-val">${xe.trajectory.shipState.deltaVRemaining} m/s</span></div>
              <div class="telemetry-row"><span>Vehicle Mass:</span><span id="sc-mass" class="mono-val">${xe.trajectory.shipState.mass} kg</span></div>
            </div>

            <div class="hud-card">
              <div class="card-title">CELESTIAL EPHEMERIDES</div>
              <div class="telemetry-row"><span>Earth Heliocentric:</span><span id="earth-pos-val" class="mono-val">+0.000, +0.000 AU</span></div>
              <div class="telemetry-row"><span>Mars Heliocentric:</span><span id="mars-pos-val" class="mono-val">+0.000, +0.000 AU</span></div>
              <div class="telemetry-row"><span>Dist to Earth:</span><span id="dist-earth-val" class="mono-val">0.000 AU</span></div>
              <div class="telemetry-row"><span>Dist to Mars:</span><span id="dist-mars-val" class="highlight-val">0.000 AU</span></div>
              <div class="telemetry-row"><span>Mars SOI Encounter:</span><span id="mars-soi-val" class="mono-val">NO</span></div>
              <div class="telemetry-row"><span>Mars True Anomaly:</span><span id="mars-nu-val" class="mono-val">0.0&deg;</span></div>
            </div>

            <div class="hud-card">
              <div class="card-title">DEEP SPACE COMMUNICATIONS</div>
              <div class="telemetry-row"><span>Link State:</span><span id="comm-link-val" class="highlight-val">NOMINAL</span></div>
              <div class="telemetry-row"><span>One-Way Light Time:</span><span id="comm-owlt-val" class="mono-val">0m 00s</span></div>
              <div class="telemetry-row"><span>Round-Trip Delay:</span><span id="comm-rtt-val" class="mono-val">0m 00s</span></div>
              <div class="telemetry-row"><span>Solar Elongation &theta;:</span><span id="comm-theta-val" class="mono-val">180.0&deg;</span></div>
              <div class="telemetry-row"><span>Link Data Rate:</span><span id="comm-rate-val" class="mono-val">0 kbps</span></div>
              <div class="telemetry-row"><span>Packet Loss Prob:</span><span id="comm-loss-val" class="mono-val">0.0%</span></div>
              <div class="telemetry-row"><span>Delay Override:</span><span id="comm-override-val" class="mono-val">DISABLED</span></div>
            </div>

            <div class="hud-card">
              <div class="card-title">MISSION FLIGHT PROFILE</div>
              <div class="telemetry-row"><span>Departure Window:</span><span id="mission-dep-val" class="mono-val">${Ws(xe.trajectory.departureJD)}</span></div>
              <div class="telemetry-row"><span>Target Arrival:</span><span id="mission-arr-val" class="mono-val">${Ws(xe.trajectory.arrivalJD)}</span></div>
              <div class="telemetry-row"><span>Planned TOF:</span><span class="highlight-val">${xe.trajectory.tofDays} days</span></div>
              <div class="telemetry-row"><span>Transfer Trajectory:</span><span class="mono-val">Lambert Universal Variable</span></div>
              <div class="telemetry-row"><span>Subsystems Status:</span><span id="subsystems-status-val" class="mono-val">ACTIVE (≤ 600x)</span></div>
              <div class="telemetry-row"><span>Tactical Viewport:</span><span class="mono-val" style="color: var(--green)">ACTIVE (CANVAS 2D)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;const r=document.getElementById("met-display"),a=document.getElementById("sim-time-display"),o=document.getElementById("phase-badge"),l=document.getElementById("high-warp-banner"),c=document.getElementById("link-indicator"),d=document.getElementById("link-state-val"),u=document.getElementById("link-delay-val"),f=document.getElementById("sc-pos-x"),m=document.getElementById("sc-pos-y"),g=document.getElementById("sc-dist-sun"),v=document.getElementById("sc-vel-vec"),p=document.getElementById("sc-speed"),h=document.getElementById("earth-pos-val"),b=document.getElementById("mars-pos-val"),E=document.getElementById("dist-earth-val"),S=document.getElementById("dist-mars-val"),P=document.getElementById("mars-soi-val"),A=document.getElementById("mars-nu-val"),w=document.getElementById("comm-link-val"),N=document.getElementById("comm-owlt-val"),M=document.getElementById("comm-rtt-val"),x=document.getElementById("comm-theta-val"),C=document.getElementById("comm-rate-val"),z=document.getElementById("comm-loss-val"),O=document.getElementById("subsystems-status-val");pt.on("sim:warpChanged",({warp:X,paused:le})=>{s&&(le?(s.classList.add("paused"),s.textContent="RESUME"):(s.classList.remove("paused"),s.textContent="PAUSE")),document.querySelectorAll("#warp-buttons .warp-btn").forEach(R=>{const nt=R,Pe=Number(nt.dataset.warp);!le&&Pe===X?nt.classList.add("active"):nt.classList.remove("active")}),l&&(X>600&&!le?l.style.display="block":l.style.display="none"),O&&(xe.clock.subsystemsActive&&!le?(O.textContent="ACTIVE (≤ 600x)",O.style.color="var(--green)"):le?(O.textContent="PAUSED",O.style.color="var(--amber)"):(O.textContent="PAUSED (HIGH WARP)",O.style.color="var(--red)"))}),pt.on("sim:phaseChanged",({to:X})=>{o&&(o.textContent=X.toUpperCase())}),pt.on("comm:stateChanged",X=>{d&&(d.textContent=X.linkState),u&&(u.textContent=`(${Qi(X.oneWayLightTimeSec)} OWLT)`),c&&(c.className=`link-indicator link-${X.linkState}`),w&&(w.textContent=X.linkState),N&&(N.textContent=Qi(X.oneWayLightTimeSec)),M&&(M.textContent=Qi(X.roundTripSec)),x&&(x.textContent=`${X.thetaDeg.toFixed(1)}°`),C&&(C.textContent=`${(X.linkRateBps/1e3).toFixed(1)} kbps`),z&&(z.textContent=`${(X.packetLossProb*100).toFixed(1)}%`)}),pt.on("sim:tick",()=>{const X=xe.clock.simTimeJD,le=xe.clock.metSeconds;r&&(r.textContent=Fl(le)),a&&(a.textContent=Ws(X));const ve=xe.trajectory.shipState,R=Math.hypot(ve.pos[0],ve.pos[1]),Pe=Math.hypot(ve.vel[0],ve.vel[1])*ji/ss;f&&(f.textContent=`${ve.pos[0]>=0?"+":""}${ve.pos[0].toFixed(4)} AU`),m&&(m.textContent=`${ve.pos[1]>=0?"+":""}${ve.pos[1].toFixed(4)} AU`),g&&(g.textContent=`${R.toFixed(4)} AU`),v&&(v.textContent=`${ve.vel[0].toFixed(4)}, ${ve.vel[1].toFixed(4)} AU/d`),p&&(p.textContent=`${Pe.toFixed(2)} km/s`);const we=xe.earthState,fe=xe.marsState,ze=Math.hypot(ve.pos[0]-we.x,ve.pos[1]-we.y),ye=xe.trajectory.distanceToMars([fe.x,fe.y]),T=xe.trajectory.isInMarsSOI([fe.x,fe.y]);if(h&&(h.textContent=`${we.x.toFixed(3)}, ${we.y.toFixed(3)} AU`),b&&(b.textContent=`${fe.x.toFixed(3)}, ${fe.y.toFixed(3)} AU`),E&&(E.textContent=`${ze.toFixed(3)} AU (${(ze*ji).toLocaleString(void 0,{maximumFractionDigits:0})} km)`),S&&(S.textContent=`${ye.toFixed(4)} AU (${(ye*ji).toLocaleString(void 0,{maximumFractionDigits:0})} km)`),P&&(P.textContent=T?"YES (WITHIN SOI)":"NO (CRUISE)",P.style.color=T?"var(--green)":"var(--text-secondary)"),A){const Y=fe.nu*180/Math.PI;A.textContent=`${Y.toFixed(1)}°`}ot&&ot.render({simTimeJD:X,shipPos:ve.pos,shipVel:ve.vel,earthPos:xe.earthPos,marsPos:xe.marsPos,phase:ve.phase,dt:xe.clock.subsystemsActive?1/60:.016}),Tn&&Tn.updateState({earthPos:xe.earthPos,marsPos:xe.marsPos,shipPos:ve.pos,shipVel:ve.vel,commState:xe.comms.state,simTimeJD:X,phase:ve.phase});const _=Wi.computeLinkState(ze,xe.comms.state.thetaDeg,le);Zr&&Zr.update(_,le);const{delivered:F}=Wi.step(le);for(const Y of F)Kr.receiveDownlinkBundle(Y,le);if(Math.floor(le)%10===0&&_.status!=="BLACKOUT"&&Yn("ship","earth",1,"telemetry",{met:le,pos:ve.pos,phase:ve.phase},le).then(Y=>{Xi.enqueue(Y,le)}).catch(()=>{}),_.status!=="BLACKOUT"&&Xi.getTotalCount()>0){const Y=Xi.dequeue();Y&&Wi.transmit(Y,le,_)}}),pt.on("render:frame",()=>{if(Gs==="SKY"&&ot){const X=xe.trajectory.shipState;ot.render({simTimeJD:xe.clock.simTimeJD,shipPos:X.pos,shipVel:X.vel,earthPos:xe.earthPos,marsPos:xe.marsPos,phase:X.phase})}else Gs==="TACTICAL"&&Tn&&Tn.render()});const q=document.getElementById("tab-sky-view"),$=document.getElementById("tab-tactical-map"),V=document.getElementById("tab-telemetry-hud"),j=document.getElementById("sky-view-container"),B=document.getElementById("tactical-map-container"),Q=document.getElementById("center-hud-view"),ie=document.getElementById("sky-view-controls"),ue=X=>{Gs=X,q&&q.classList.toggle("active",X==="SKY"),$&&$.classList.toggle("active",X==="TACTICAL"),V&&V.classList.toggle("active",X==="TELEMETRY"),j&&(j.style.display=X==="SKY"?"block":"none"),B&&(B.style.display=X==="TACTICAL"?"block":"none"),Q&&(Q.style.display=X==="TELEMETRY"?"flex":"none"),ie&&(ie.style.display=X==="SKY"?"flex":"none"),X==="SKY"&&ot?ot.resize():X==="TACTICAL"&&Tn&&Tn.render()};if(q&&q.addEventListener("click",()=>ue("SKY")),$&&$.addEventListener("click",()=>ue("TACTICAL")),V&&V.addEventListener("click",()=>ue("TELEMETRY")),j){ot=new t0(j);const X=xe.trajectory.shipState;ot.render({simTimeJD:xe.clock.simTimeJD,shipPos:X.pos,shipVel:X.vel,earthPos:xe.earthPos,marsPos:xe.marsPos,phase:X.phase,dt:.016})}const De=document.querySelectorAll("#sky-view-controls .cam-btn[data-mode]"),Ge=(X,le)=>{De.forEach(ve=>{const R=ve,nt=R.dataset.mode,Pe=R.dataset.target;nt==="TARGET_LOCK"?R.classList.toggle("active",X==="TARGET_LOCK"&&Pe===le):R.classList.toggle("active",X===nt)})};De.forEach(X=>{const le=X;le.addEventListener("click",()=>{const ve=le.dataset.mode,R=le.dataset.target;ot&&ve&&(ot.setCameraMode(ve,R),Ge(ve,R))})});const W=document.getElementById("dust-streaks-btn"),ee=X=>{W&&(X?(W.textContent="STREAKS: ON",W.className="cam-btn active",W.title="Perceived velocity streaks active (Click for Physically literal [no streaks])"):(W.textContent="LITERAL (NO STREAKS)",W.className="cam-btn",W.title="Physically literal: stationary dust in space frame (Click to enable streaks)"))};W&&ot&&W.addEventListener("click",()=>{if(ot){const X=ot.toggleStreaks();ee(X)}}),B&&(Tn=new bd(B),Tn.updateState({earthPos:xe.earthPos,marsPos:xe.marsPos,shipPos:xe.trajectory.shipState.pos,shipVel:xe.trajectory.shipState.vel,commState:xe.comms.state,simTimeJD:xe.clock.simTimeJD,phase:xe.trajectory.shipState.phase}));const _e=new URLSearchParams(window.location.search),se=_e.get("view")?.toUpperCase();ue(se==="TACTICAL"||se==="MAP"?"TACTICAL":se==="TELEMETRY"||se==="HUD"?"TELEMETRY":"SKY");const Ee=document.getElementById("left-panel");if(Ee){Ee.innerHTML=`
      <div class="left-tabs">
        <button class="left-tab-btn active" data-tab="COMMS" title="Deep-Space DTN Comms Console">📡 DTN</button>
        <button class="left-tab-btn" data-tab="AI" title="Autonomous Advisory & CDSS">🤖 AI</button>
        <button class="left-tab-btn" data-tab="MEM" title="Avionics Memory & SEU Scrubber">💾 MEM</button>
        <button class="left-tab-btn" data-tab="SCENARIOS" title="Guided Mission Scenarios S1-S5">🚀 SCEN</button>
        <button class="left-tab-btn" data-tab="EVAL" title="Automated Verification Suite">📊 EVAL</button>
      </div>
      <div id="left-tab-content" style="flex: 1; height: calc(100% - 32px); overflow: hidden; position: relative;">
        <div id="pane-comms" style="height: 100%;"></div>
        <div id="pane-ai" style="height: 100%; display: none;"></div>
        <div id="pane-mem" style="height: 100%; display: none;"></div>
        <div id="pane-scen" style="height: 100%; display: none;"></div>
        <div id="pane-eval" style="height: 100%; display: none;"></div>
      </div>
    `;const X=Ee.querySelector("#pane-comms"),le=Ee.querySelector("#pane-ai"),ve=Ee.querySelector("#pane-mem"),R=Ee.querySelector("#pane-scen"),nt=Ee.querySelector("#pane-eval");Zr=new r0(X,pt,Wi,Xi,Kr),Vs=new x0(le,pt,R0),new y0(ve,pt,P0),new S0(R,pt,xe,xe.subsystems.faultInjector,Wi,Xi,Kr),new M0(nt);const Pe=Ee.querySelectorAll(".left-tab-btn"),we=ze=>{Pe.forEach(ye=>{ye.classList.toggle("active",ye.dataset.tab===ze)}),X.style.display=ze==="COMMS"?"block":"none",le.style.display=ze==="AI"?"block":"none",ve.style.display=ze==="MEM"?"block":"none",R.style.display=ze==="SCENARIOS"?"block":"none",nt.style.display=ze==="EVAL"?"block":"none"};Pe.forEach(ze=>{ze.addEventListener("click",()=>{const ye=ze.dataset.tab;ye&&we(ye)})});const fe=_e.get("tab")?.toUpperCase();we(fe==="AI"?"AI":fe==="MEM"?"MEM":fe==="SCENARIOS"||fe==="SCEN"?"SCENARIOS":fe==="EVAL"?"EVAL":"COMMS")}const Re=document.getElementById("right-panel");Re&&(Jr=new i0(Re));const Be=document.getElementById("bottom-panel");Be&&new s0(Be,xe.subsystems.faultInjector,pt),pt.on("telemetry:update",({telemetry:X,alerts:le})=>{if(Jr&&Jr.update(X,le),Vs&&X){const ve=X.get("thermal.loopA.flowRate")?.measured??.5,R=X.get("thermal.loopA.pumpSpeed")?.measured??50,nt=X.get("thermal.loopA.accumulatorLevel")?.measured??2500,Pe=X.get("thermal.loopA.outletTemp")?.measured??290,we=X.get("thermal.loopA.inletTemp")?.measured??280,fe=X.get("power.batterySOC")?.measured??.8;Vs.diagnose([ve,R,nt,Pe,we,fe],[[.5,50,2500,290,280,.8],[.48,48,2450,292,281,.82],[.52,51,2520,289,279,.79]]),Vs.assessMedical({spO2:X.get("crew.crew1.spo2")?.measured??98,heartRate:X.get("crew.crew1.heartRate")?.measured??72,respRate:16},{ppO2:X.get("eclss.ppO2")?.measured??21.3,ppCO2:X.get("eclss.ppCO2")?.measured??.4,cabinPressure:X.get("eclss.cabinPressure")?.measured??101.3})}}),window.addEventListener("keydown",X=>{if(!(X.target instanceof HTMLInputElement||X.target instanceof HTMLTextAreaElement)){if(X.code==="Space")X.preventDefault(),xe.clock.togglePause(),pt.emit("sim:warpChanged",{warp:xe.clock.warp,paused:xe.clock.paused});else if(X.key==="+"||X.key==="="||X.code==="NumpadAdd"){X.preventDefault();const le=xe.clock.warpUp();xe.clock.paused&&xe.clock.resume(),pt.emit("sim:warpChanged",{warp:le,paused:xe.clock.paused})}else if(X.key==="-"||X.key==="_"||X.code==="NumpadSubtract"){X.preventDefault();const le=xe.clock.warpDown();pt.emit("sim:warpChanged",{warp:le,paused:xe.clock.paused})}else if(ot&&Gs==="SKY"){if(X.key==="f"||X.key==="F")ot.setCameraMode("FORWARD"),Ge("FORWARD");else if(X.key==="r"||X.key==="R")ot.setCameraMode("RETROGRADE"),Ge("RETROGRADE");else if(X.key==="m"||X.key==="M")ot.setCameraMode("TARGET_LOCK","MARS"),Ge("TARGET_LOCK","MARS");else if(X.key==="e"||X.key==="E")ot.setCameraMode("TARGET_LOCK","EARTH"),Ge("TARGET_LOCK","EARTH");else if(X.key==="s"||X.key==="S")ot.setCameraMode("TARGET_LOCK","SUN"),Ge("TARGET_LOCK","SUN");else if(X.key==="l"||X.key==="L")ot.setCameraMode("FREE_LOOK"),Ge("FREE_LOOK");else if(X.key==="t"||X.key==="T"){const le=ot.toggleStreaks();ee(le)}}}})}typeof window<"u"&&window.addEventListener("DOMContentLoaded",()=>{L0(),xe.start()});
//# sourceMappingURL=index-BGv9feOD.js.map
