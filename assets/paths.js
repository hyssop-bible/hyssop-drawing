/* =====================================================================
   이미지 파일 관리 (assets 폴더)

   assets/lesson1/ ~ assets/lesson6/  — 각 과별 사진·아이콘

   사용법: ASSET.lesson6("십자가.jpg")  →  assets/lesson6/십자가.jpg
   ===================================================================== */
var ASSET={
  lesson1:function(name){ return "assets/lesson1/"+name; },
  lesson2:function(name){ return "assets/lesson2/"+name; },
  lesson3:function(name){ return "assets/lesson3/"+name; },
  lesson4:function(name){ return "assets/lesson4/"+name; },
  lesson5:function(name){ return "assets/lesson5/"+name; },
  lesson6:function(name){ return "assets/lesson6/"+name; }
};
