// tfmenu.js  ver 1.4
// http://www.kakura.jp/pg/tfmenu/
//
// Daisuke Kakura <info@kakura.jp> "2007-07-23 Mon 16:59:12 Cuzco, Peru"
// Some Rights Reserved under Creative Commons License.
// http://creativecommons.org/licenses/by/2.1/jp/

// 設定可能な変数 -----------------------------------------------------------------------
var expand_speed = 150;  // メニュー項目を開閉する速さ (ミリ秒)
var updown_speed =  10;  // メニューが移動する速さ (ミリ秒)
var steps        =  30;  // メニューが updown_speed ミリ秒ごとに移動するピクセル幅
var jump         =   1;  // メニューが離れすぎたら高速移動する (1: yes 0: no)
var sticky       =   0;  // メニューを固定する (1: yes 0: no)

// IE 以外のブラウザでメニューが移動するピクセル幅
// Firefox は IE よりなぜか遅いので、このピクセル幅を増やして対応する
var steps2       =  10;  // メニューが updown_speed ミリ秒ごとに移動するピクセル幅

// メニュー HTML (下記の説明参照)
var menu_html =
//"<div id='tfm-head'></div>" +
"<div id='tfm-body'>" +
"<div id='item1'     class='tf1'>0.TOP" +
"</div>" +
"<div id='item2'     class='tf1'><a href='#M1'>1.INFO</a>" +
"</div>" +
"<div id='item3'     class='tf1'><a href='#M2'>2.ABOUT</a>" +
"</div>" +
"<div id='item4'     class='tf1'><a href='#M3'>3.WORKS (mp3,bms)</a>" +
"</div>" +
"<div id='item5'     class='tf1'><a href='#M4'>4.ACT</a>" +
"</div>" +
"<div id='item6'     class='tf1'><a href='#M5'>5.CONTACT</a>" +
"</div>" +
"<div id='item7'     class='tf1'><a href='#M6'>6.LINK</a>" +
"</div>" +  // end of #tfm-body
"<div id='tfm-foot'></div>"
;

// 設定可能な変数 ここまで  -------------------------------------------------------------


// 説明  --------------------------------------------------------------------------------
/*
// ++++++++++  tfmenu.js で使用する id と class 名、および上下関係

#tfmenu                        メニュー全体
#tfmenu #tfm-head              メニュー上部
#tfmenu #tfm-body              メニュー本文 上記の menu_html はここに入る
#tfmenu #tfm-body .tf1         メニュー親項目
#tfmenu #tfm-body .tf1active   開いているメニュー親項目
#tfmenu #tfm-body .tf1 .tf2    メニュー子項目
#tfmenu #tfm-foot              メニュー下部

menu_html の内容は tfmenu.js (このファイル) を直接書き換えてください。
これにより、ひとつのファイルを書き換えるだけで、すべてのページに反映さ
れるようになります。

// ++++++++++  メニュー移動時に #tfmenu に付加される class 名

.tfm-up                        上昇中
.tfm-down                      下降中
.tfm-stop                      停止中

移動中の状態を class で指定することにより、状態に合わせてデザインを変
更できます。

// ++++++++++  メニュー HTML の書き方

#tfm-body 内のメニュー項目は、<div> で作ります。子項目の .tf2 は、親項
目である .tf1 の内側に配置してください。tfm-body の終了タグを忘れない
ように。

例:

"<div id='tfm-head'></div>" +
"<div id='tfm-body'>" +
"<div class='tf1'>親項目 1" +
"   <div class='tf2'>子項目 1.1</div>" +
"   <div class='tf2'>子項目 1.2</div>" +
"   <div class='tf2'>子項目 1.3</div>" +
"</div>" +
"<div class='tf1'>親項目 2" +
"   <div class='tf2'>子項目 2.1</div>" +
"   <div class='tf2'>子項目 2.2</div>" +
"   <div class='tf2'>子項目 2.3</div>" +
"</div>" +
"</div>" +  // end of #tfm-body
"<div id='tfm-foot'></div>";


// ++++++++++  HTML にメニューを配置する方法

<head> タグの中に下記の一行を追加。

<script type="text/javascript" src="tfmenu.js"></script>

<body> タグの中、メニューを配置したい場所に下記の一行を追加。

<div id="tfmenu"></div>

予め特定のメニュー項目を開いておきたい場合は、menu_html 内の親項目に
id を付けて、その id を上記の一行に name として指定する。

例:

menu_html の内容

"<div id='tfm-head'></div>" +
"<div id='tfm-body'>" +
"<div id='oya1' class='tf1'>親項目 1" +
"   <div class='tf2'>子項目 1.1</div>" +
"   <div class='tf2'>子項目 1.2</div>" +
"   <div class='tf2'>子項目 1.3</div>" +
"</div>" +
"</div>" +  // end of #tfm-body
"<div id='tfm-foot'></div>";

name="item3" を追加。

<div id="tfmenu" name="item3"></div>


// ++++++++++  History

2007-07-23 v1.4  Daisuke: IE 以外のブラウザ用に、別の移動ピクセル幅を指定できるように変数を追加。
2007-07-13 v1.3  Kohdai:  bug fix: pre-open 'name' attribute did not work on Firefox. Thanks!
2007-07-04 v1.2  Daisuke: changed value of 'var sticky'.
2007-05-24 v1.1  Daisuke: bug fix: if expand_speed was too fast, link did not work.
2006-10-31 v1.0  Daisuke: created.

*/

// ここから下は変更しないでください------------------------------------------------------
// 改良、バグ修正された方は新しいバージョンに取り入れさせてください → info@kakura.jp

var curr_y;
var istimerc_on = 0;
var istimere_on = 0;
var limit_y;
var menu_pos = new Object();
var status_p;
var tfm_body;
var tfmenu;
var isInternetExplorer;

if (navigator.appName.indexOf("Microsoft") < 0) {
   // it's not IE.
   steps = steps2;
}

function expandMenu(e) {
   var close_only = 0;
   var col_elem;
   var exp_elem;
   var ic;
   var ie;
   var isopen = 0;
   var target_elem;
   var target_node;
   var timerc;
   var timere;

   var collapseItem = function() {
      if(col_elem[ic]) {
         setVisibility(col_elem[ic], "hidden");
         ic++;
      } else {
         clearInterval(timerc);
         istimerc_on = 0;
      }
   }
   var expandItem = function() {
      if(!istimerc_on) {
         if(exp_elem[ie]) {
            setVisibility(exp_elem[ie], "visible");
            ie++;
         } else {
            clearInterval(timere);
            istimere_on = 0;
         }
      }
   }

   if(e.target) {
      target_node = e.target;
   } else if (e.srcElement) {
      target_node = e.srcElement;
   }
   // for Safari.
   if (target_node.nodeType == 3) {
      target_node = target_node.parentNode;
   }
   target_elem = target_node.getElementsByTagName("div");
   // if a gap between items (background tfm_body) was clicked, ignore.
   if(target_node.id == "tfm-body") {
      return;
   }
   // if the top item was clicked and it was already open, just close it.
   if(target_elem[0]) {
      if(target_elem[0].style.visibility == "visible") {
         close_only = 1;
      }
   }
   // collapse menu.
   if(!istimerc_on && !istimere_on) {
      for(var i = 0; i < tfm_body.length && !isopen; ++i) { // search the first visible chiled item.
         col_elem = tfm_body[i].getElementsByTagName("div");
         for(var ii = 0; ii < col_elem.length; ++ii) {
            if(col_elem[ii].style.visibility == "visible") {
               isopen = 1;
               break;
            }
         }
      }
      if(isopen) {
         ic          = 0;
         istimerc_on = 1;
         timerc      = setInterval(collapseItem, expand_speed);
      }
   }
   // expand active menu items.
   if(!istimere_on && !close_only) {
      exp_elem    = target_elem;
      ie          = 0;
      istimere_on = 1;
      timere      = setInterval(expandItem, expand_speed);
   }
}

function setVisibility(e, value) {
   e.style.visibility = value;
   if(value == "hidden") {
      e.style.lineHeight     = "0px";
      e.parentNode.className = "tf1";
   } else {
      e.style.lineHeight     = "100%";
      e.parentNode.className = "tf1active";
   }
}

function setTopPos() {
   var target_y    = document.body.scrollTop;
// var suffix_y;
   var dance_steps = steps;
   var distance;
   var status;

   distance = Math.abs(target_y - curr_y);

   // if menu box was too far from active area, then speed up.
   if(jump && tfmenu.offsetHeight * 2 < distance) {
      dance_steps = steps * 10;
   }
   // slow down if it's getting closer.
   if(distance < 25) {
      dance_steps = 1;
   }
   // do not exceed the bottom of the parent element.
   if(limit_y <= target_y) {
      target_y = limit_y;
      curr_y   = limit_y;
   }
   // going up or donw?
   if(curr_y > target_y) {
      curr_y -= dance_steps; // ascending
      status = "tfm-up";
   } else if(curr_y < target_y) {
      curr_y += dance_steps; // descending
      status = "tfm-down";
   } else {
      status = "tfm-stop";
   }
   if(distance != 0) {
      tfmenu.style.top = curr_y + "px";
   }
   // change status (class name)
   if(status_p != status) {
      status_p = status;
      tfmenu.className = status;
   }
}

function setListeners(e) {
   var i;
   var ii;
   tfmenu           = document.getElementById("tfmenu");
   tfmenu.innerHTML = menu_html;
   tfm_body         = document.getElementById("tfm-body")
   tfmenu.className = "tfm-stop";
   addListener(tfm_body, 'mouseup', expandMenu, false);
   tfm_body         = tfm_body.childNodes;

   for(i = 0; i < tfm_body.length; ++i) {
      // if name property was set, make that node (id) to visible.
      var items = tfm_body[i].getElementsByTagName("div");
      var visib = "hidden";
      if(tfmenu.getAttribute('name') == tfm_body[i].id) {
         visib = "visible";
      }
      for(ii = 0; ii < items.length; ++ii) {
         setVisibility(items[ii], visib);
      }
   }

   tfmenu.style.position = "absolute";
   tfmenu.style.left     = "0px";
   if(sticky) {
      tfmenu.style.top = "0px";
   } else {
      curr_y           = document.body.scrollTop;
      tfmenu.style.top = curr_y + "px";
      setInterval("setTopPos()", updown_speed);
   }
   // bug: if there is no parent element, limit_y will be screen height which is too short.
   limit_y = tfmenu.parentNode.offsetHeight - tfmenu.offsetHeight;
}

function addListener(elem, eventType, func, cap) {
   if(elem.addEventListener) {
      elem.addEventListener(eventType, func, cap);
   } else if(elem.attachEvent) {
      elem.attachEvent('on' + eventType, func);
   } else {
      window.alert("Sorry... Please use Internet Explorer or Firefox.");
      return false;
   }
}

addListener(window, 'load', setListeners, false);

// eof
