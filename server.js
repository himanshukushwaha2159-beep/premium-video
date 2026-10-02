const express=require('express');
const path=require('path');
const fs=require('fs');

const app=express();
const PORT=3000;

app.use(express.static(path.join(__dirname,'public')));

app.get('/video',(req,res)=>{
  res.sendFile(path.join(__dirname,'private','video.html'));
});

app.get('/stream',(req,res)=>{
  const file=path.join(__dirname,'private','my-video.mp4');

  if(!fs.existsSync(file)){
    return res.status(404).send('Video not found');
  }

  const stat=fs.statSync(file);
  const range=req.headers.range;

  if(!range){
    res.writeHead(200,{
      'Content-Length':stat.size,
      'Content-Type':'video/mp4'
    });
    return fs.createReadStream(file).pipe(res);
  }

  const parts=range.replace(/bytes=/,'').split('-');
  const start=parseInt(parts[0],10);
  const end=parts[1] ? parseInt(parts[1],10) : stat.size-1;
  const chunk=end-start+1;

  res.writeHead(206,{
    'Content-Range':`bytes ${start}-${end}/${stat.size}`,
    'Accept-Ranges':'bytes',
    'Content-Length':chunk,
    'Content-Type':'video/mp4'
  });

  fs.createReadStream(file,{start,end}).pipe(res);
});

app.listen(PORT,()=>console.log('✅ Website running at http://localhost:'+PORT));
