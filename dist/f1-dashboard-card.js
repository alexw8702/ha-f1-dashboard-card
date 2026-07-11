(function(){"use strict";/**
* @vue/shared v3.5.39
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function rs(e){const t=Object.create(null);for(const s of e.split(","))t[s]=1;return s=>s in t}const X={},nt=[],Ze=()=>{},Us=()=>!1,$t=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&(e.charCodeAt(2)>122||e.charCodeAt(2)<97),Ot=e=>e.startsWith("onUpdate:"),ae=Object.assign,qs=(e,t)=>{const s=e.indexOf(t);s>-1&&e.splice(s,1)},On=Object.prototype.hasOwnProperty,W=(e,t)=>On.call(e,t),L=Array.isArray