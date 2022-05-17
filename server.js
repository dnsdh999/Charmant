const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({extended: true})) 
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.2wsxq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
 function(에러, client){
    if (에러) return console.log(에러)
    //서버띄우는 코드 여기로 옮기기

    db = client.db('charmant');

    app.listen('8080', function(){
      console.log('listening on 8080')
    });
  })
app.get('/', function(요청, 응답){
    app.use(express.static(__dirname + '/css'));
    응답.render('./index/index.ejs')
})



// ////////////////// ///////////////////////////////////////
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 


app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(요청, 응답){
    응답.redirect('/')  //로그인이 성공하면 홈페이지로
});

    //로컬스트레티지 인증방식 코드
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('user').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
      if (!결과) return done(null, false, { message: '존재하지않는 아이디입니다' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
  }));

  passport.serializeUser(function(user, done){  //id를 세션에 저장
      done(null, user.id)
  });

  passport.deserializeUser(function(아이디, done){  //마이페이지 접속시 발동, 로그인한 유저의 개인정보를 db에서 찾는 역할
    //디비에서 위에 있는 user.id로 유저를 찾은 뒤에 유저 정보를 던(널, 옆에 넣음.
    db.collection('user').findOne({id : 아이디}, function(에러, 결과){
        done(null, 결과)
    })
    
  });


  app.get('/logingo',로그인했나요, function(요청, 응답){
    app.use(express.static(__dirname + '/views/log'));
    응답.render('./log/login.ejs')
})
function 로그인했나요(요청, 응답, next){
    if(요청.user){
        응답.send('이미 로그인 되어있음.')
        console.log(요청.user)
    }else{
        next()
    }
}
// ///////////////////////////////////////////////////////
  //마이페이지
  app.get('/mypage',로그인했니, function(요청, 응답){
    console.log(요청.user)
    응답.render('./log/mypage.ejs',{사용자 : 요청.user})
  })

  function 로그인했니(요청, 응답, next){
    if(요청.user){
        //console.log(요청.user)
        next()
    }else{
      응답.redirect("/logingo")
    }
} 
// ///////////////////////////////////////////////////////

// 로그인이 되었는지 확인하고, 되어있으면 /logout으로. 되어있지 않으면 /signup으로
  app.get("/signup", function(요청,응답,next){
    if(요청.user){
    요청.session.destroy();
    응답.clearCookie('sid');
    응답.redirect("/")}
    else{
      응답.redirect('/join')
    }
  })

  app.get('/join', function(요청, 응답){
    app.use(express.static(__dirname + '/views/log'));
    응답.render('./log/loginj.ejs')  
  });

app.post('/joinadd', function(요청, 응답){
    db.collection('user').findOne({id : 요청.body.id}, function(에러, 결과){
        if(결과 === null){
            db.collection('user').insertOne({name : 요청.body.name, id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
            console.log('회원가입완료')
              응답.redirect('/')
            });     
        }
        else{
            응답.send('동일한 아이디 존재 다시시도바랍니다.');
        }
    })
});

app.get('/review', function(요청, 응답){
  app.use(express.static(__dirname + '/css'));
  응답.render('./index/review.ejs')
})

app.get('/q&a', function(요청, 응답){
  app.use(express.static(__dirname + '/css'));
  응답.render('./index/q&a.ejs')
})

app.get('/cart', function(요청, 응답){
  app.use(express.static(__dirname + '/css'));
  응답.render('./index/basket.ejs')
})

app.get('/perfume', function(요청, 응답){
  console.log(__dirname)
  app.use(express.static(__dirname + '/css'));
  db.collection('post').find().toArray(function(에러, 결과){ //모든 걸 다 가져올게요.
    console.log(결과); //이것을 이제 ejs에 넣어보자
    응답.render('./index/perfume.ejs', {posts : 결과});
});   
})

app.get('/brand', function(요청, 응답){
  app.use(express.static(__dirname + '/css'));
  응답.render('./index/brand.ejs')
})