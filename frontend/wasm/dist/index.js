(()=>{"use strict";class e extends AudioWorkletProcessor{initialized=!1;playBuffer=[];deltaChunkSize=24;crossFadeOffsetRate=.3;crossFadeEndRate=.6;crossFadeLowerValue=.1;crossFadeType=1;bufferSize=1024;constructor(){super(),this.initialized=!0,this.port.onmessage=this.handleMessage.bind(this)}prevF32Data=null;handleMessage(e){if(e.data.deltaSize)return console.log("change props",e.data),this.deltaChunkSize=e.data.deltaSize,this.crossFadeOffsetRate=e.data.crossFadeOffsetRate,this.crossFadeEndRate=e.data.crossFadeEndRate,this.crossFadeLowerValue=e.data.crossFadeLowerValue,void(this.crossFadeType=e.data.crossFadeType);const t=e.data.data,s=new Int16Array(t),a=new Float32Array(s.length);s.forEach(((e,t)=>{const s=e>=32768?-(65536-e)/32768:e/32767;a[t]=s}));const r=this.bufferSize/2*this.deltaChunkSize,o=Math.max(a.length-2*r,0),i=o+r,l=this.prevF32Data?i:0;let n,h=this.prevF32Data?this.prevF32Data.slice(l):null,c=a.slice(o,i);if(h?.length!==c.length&&(h=null),h){const e=h.length*this.crossFadeOffsetRate,t=h.length*this.crossFadeEndRate-e;for(let s=0;s<h.length;s++){let a=0;if(s<e){a=0;const e=h[s]*(1-a),t=c[s]*a;c[s]=e+t}else if(1===this.crossFadeType){const a=s-e,r=Math.min(1,1/t*a),o=h[s]*(1-r),i=c[s]*r;c[s]=o+i}else{const a=s-e,r=Math.min(1,1/t*a),o=Math.cos(.5*r*Math.PI),i=Math.cos(.5*(1-r)*Math.PI),l=h[s]*o,n=c[s]*i;c[s]=l+n}}}if(this.playBuffer.length>50)for(console.log("Buffer truncated");this.playBuffer.length>2;)this.playBuffer.shift();for(let e=0;e<c.length;e++){const t=2*e%128;0===t&&(n=new Float32Array(128));const s=c[e],a=e+1<c.length?c[e+1]:c[e];n[t]=s,n[t+1]=(s+a)/2,n.length===t+2&&this.playBuffer.push(n)}this.prevF32Data=a}process(e,t,s){if(!this.initialized)return console.log("worklet_process not ready"),!0;if(0===this.playBuffer.length)return!0;const a=this.playBuffer.shift();return t[0][0].set(a),!0}}registerProcessor("voice-player-worklet-processor",e)})();