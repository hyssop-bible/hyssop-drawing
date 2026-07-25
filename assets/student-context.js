(function(global){
  "use strict";

  var STORAGE_KEY="hyssop-selected-student";
  var DEFAULT_STUDENT="이민래";
  var STUDENTS=[
    "김도해","임권묵","김성언","왕서윤","이민래",
    "김민솔","정은찬","이상휘","이서인","임수정"
  ];
  var PROFILES={
    "김도해":{photo:"assets/students/김도해.jpg"},
    "임권묵":{photo:"assets/students/임권묵.jpg"},
    "김성언":{photo:"assets/students/김성언.jpg"},
    "왕서윤":{photo:"assets/students/왕서윤.jpg"},
    "이민래":{photo:"assets/students/이민래.jpg"},
    "김민솔":{photo:"assets/students/김민솔.jpg"},
    "정은찬":{photo:"assets/students/정은찬.jpg"},
    "이상휘":{photo:"assets/students/이상휘.jpg"},
    "이서인":{photo:"assets/students/이서인.jpg"}
  };

  function isStudent(name){
    return STUDENTS.indexOf(name)!==-1;
  }
  function queryStudent(){
    try{
      var name=new URLSearchParams(global.location.search).get("student")||"";
      return isStudent(name)?name:"";
    }catch(e){ return ""; }
  }
  function storedStudent(){
    try{
      var name=global.sessionStorage.getItem(STORAGE_KEY)||"";
      return isStudent(name)?name:"";
    }catch(e){ return ""; }
  }
  function save(name){
    if(!isStudent(name)) return false;
    try{ global.sessionStorage.setItem(STORAGE_KEY,name); }catch(e){}
    return true;
  }
  function clear(){
    try{ global.sessionStorage.removeItem(STORAGE_KEY); }catch(e){}
  }
  function displayName(fullName){
    return fullName&&fullName.length>1?fullName.slice(1):fullName;
  }
  function hasFinalConsonant(word){
    if(!word) return false;
    var code=word.charCodeAt(word.length-1);
    return code>=0xAC00&&code<=0xD7A3&&(code-0xAC00)%28!==0;
  }
  function friendlyName(fullName){
    var shortName=displayName(fullName);
    return shortName+(hasFinalConsonant(shortName)?"이":"");
  }
  function withParticle(word,consonantParticle,vowelParticle){
    if(!word) return "";
    return word+(hasFinalConsonant(word)?consonantParticle:vowelParticle);
  }

  var selectedName=queryStudent()||storedStudent();
  if(selectedName) save(selectedName);
  var fullName=selectedName||DEFAULT_STUDENT;
  var shortName=displayName(fullName);
  var name=friendlyName(fullName);
  var profile=PROFILES[fullName]||{};

  global.STUDENT_CONTEXT={
    students:STUDENTS.slice(),
    selectedName:selectedName,
    fullName:fullName,
    shortName:shortName,
    name:name,
    honorific:name,
    objectName:withParticle(name,"을","를"),
    subjectName:withParticle(name,"이","가"),
    photo:profile.photo||null,
    displayName:displayName,
    friendlyName:friendlyName,
    withObjectParticle:function(word){return withParticle(word,"을","를");},
    withSubjectParticle:function(word){return withParticle(word,"이","가");},
    select:save,
    clear:clear
  };

  if(selectedName){
    global.addEventListener("DOMContentLoaded",function(){
      var homeLinks=document.querySelectorAll('a[href="index.html"]');
      for(var i=0;i<homeLinks.length;i++){
        homeLinks[i].setAttribute("href","index.html?student="+encodeURIComponent(selectedName));
      }
    });
  }
})(window);
