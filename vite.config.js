import {defineConfig} from 'vite';

export default defineConfig({
 base:process.env.SITE_BASE_PATH || '/',
 build:{rolldownOptions:{input:{main:'index.html',cinematic:'cinematic.html',toon:'toon.html'}}},
 server:{
  watch:{ignored:['**/artifacts/**','**/render/**','**/.npm-cache/**']}
 }
});
