/*******************************************************/
/*  Libraries
/*******************************************************/

/*! Magnific Popup - v1.0.0 - 2015-01-03
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2015 Dmitry Semenov; */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):window.jQuery||window.Zepto)}(function(a){var b,c,d,e,f,g,h="Close",i="BeforeClose",j="AfterClose",k="BeforeAppend",l="MarkupParse",m="Open",n="Change",o="mfp",p="."+o,q="mfp-ready",r="mfp-removing",s="mfp-prevent-close",t=function(){},u=!!window.jQuery,v=a(window),w=function(a,c){b.ev.on(o+a+p,c)},x=function(b,c,d,e){var f=document.createElement("div");return f.className="mfp-"+b,d&&(f.innerHTML=d),e?c&&c.appendChild(f):(f=a(f),c&&f.appendTo(c)),f},y=function(c,d){b.ev.triggerHandler(o+c,d),b.st.callbacks&&(c=c.charAt(0).toLowerCase()+c.slice(1),b.st.callbacks[c]&&b.st.callbacks[c].apply(b,a.isArray(d)?d:[d]))},z=function(c){return c===g&&b.currTemplate.closeBtn||(b.currTemplate.closeBtn=a(b.st.closeMarkup.replace("%title%",b.st.tClose)),g=c),b.currTemplate.closeBtn},A=function(){a.magnificPopup.instance||(b=new t,b.init(),a.magnificPopup.instance=b)},B=function(){var a=document.createElement("p").style,b=["ms","O","Moz","Webkit"];if(void 0!==a.transition)return!0;for(;b.length;)if(b.pop()+"Transition"in a)return!0;return!1};t.prototype={constructor:t,init:function(){var c=navigator.appVersion;b.isIE7=-1!==c.indexOf("MSIE 7."),b.isIE8=-1!==c.indexOf("MSIE 8."),b.isLowIE=b.isIE7||b.isIE8,b.isAndroid=/android/gi.test(c),b.isIOS=/iphone|ipad|ipod/gi.test(c),b.supportsTransition=B(),b.probablyMobile=b.isAndroid||b.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent),d=a(document),b.popupsCache={}},open:function(c){var e;if(c.isObj===!1){b.items=c.items.toArray(),b.index=0;var g,h=c.items;for(e=0;e<h.length;e++)if(g=h[e],g.parsed&&(g=g.el[0]),g===c.el[0]){b.index=e;break}}else b.items=a.isArray(c.items)?c.items:[c.items],b.index=c.index||0;if(b.isOpen)return void b.updateItemHTML();b.types=[],f="",b.ev=c.mainEl&&c.mainEl.length?c.mainEl.eq(0):d,c.key?(b.popupsCache[c.key]||(b.popupsCache[c.key]={}),b.currTemplate=b.popupsCache[c.key]):b.currTemplate={},b.st=a.extend(!0,{},a.magnificPopup.defaults,c),b.fixedContentPos="auto"===b.st.fixedContentPos?!b.probablyMobile:b.st.fixedContentPos,b.st.modal&&(b.st.closeOnContentClick=!1,b.st.closeOnBgClick=!1,b.st.showCloseBtn=!1,b.st.enableEscapeKey=!1),b.bgOverlay||(b.bgOverlay=x("bg").on("click"+p,function(){b.close()}),b.wrap=x("wrap").on("click"+p,function(a){b._checkIfClose(a.target)&&b.close()}),b.container=x("container",b.wrap)),b.contentContainer=x("content"),b.st.preloader&&(b.preloader=x("preloader",b.container,b.st.tLoading));var i=a.magnificPopup.modules;for(e=0;e<i.length;e++){var j=i[e];j=j.charAt(0).toUpperCase()+j.slice(1),b["init"+j].call(b)}y("BeforeOpen"),b.st.showCloseBtn&&(b.st.closeBtnInside?(w(l,function(a,b,c,d){c.close_replaceWith=z(d.type)}),f+=" mfp-close-btn-in"):b.wrap.append(z())),b.st.alignTop&&(f+=" mfp-align-top"),b.wrap.css(b.fixedContentPos?{overflow:b.st.overflowY,overflowX:"hidden",overflowY:b.st.overflowY}:{top:v.scrollTop(),position:"absolute"}),(b.st.fixedBgPos===!1||"auto"===b.st.fixedBgPos&&!b.fixedContentPos)&&b.bgOverlay.css({height:d.height(),position:"absolute"}),b.st.enableEscapeKey&&d.on("keyup"+p,function(a){27===a.keyCode&&b.close()}),v.on("resize"+p,function(){b.updateSize()}),b.st.closeOnContentClick||(f+=" mfp-auto-cursor"),f&&b.wrap.addClass(f);var k=b.wH=v.height(),n={};if(b.fixedContentPos&&b._hasScrollBar(k)){var o=b._getScrollbarSize();o&&(n.marginRight=o)}b.fixedContentPos&&(b.isIE7?a("body, html").css("overflow","hidden"):n.overflow="hidden");var r=b.st.mainClass;return b.isIE7&&(r+=" mfp-ie7"),r&&b._addClassToMFP(r),b.updateItemHTML(),y("BuildControls"),a("html").css(n),b.bgOverlay.add(b.wrap).prependTo(b.st.prependTo||a(document.body)),b._lastFocusedEl=document.activeElement,setTimeout(function(){b.content?(b._addClassToMFP(q),b._setFocus()):b.bgOverlay.addClass(q),d.on("focusin"+p,b._onFocusIn)},16),b.isOpen=!0,b.updateSize(k),y(m),c},close:function(){b.isOpen&&(y(i),b.isOpen=!1,b.st.removalDelay&&!b.isLowIE&&b.supportsTransition?(b._addClassToMFP(r),setTimeout(function(){b._close()},b.st.removalDelay)):b._close())},_close:function(){y(h);var c=r+" "+q+" ";if(b.bgOverlay.detach(),b.wrap.detach(),b.container.empty(),b.st.mainClass&&(c+=b.st.mainClass+" "),b._removeClassFromMFP(c),b.fixedContentPos){var e={marginRight:""};b.isIE7?a("body, html").css("overflow",""):e.overflow="",a("html").css(e)}d.off("keyup"+p+" focusin"+p),b.ev.off(p),b.wrap.attr("class","mfp-wrap").removeAttr("style"),b.bgOverlay.attr("class","mfp-bg"),b.container.attr("class","mfp-container"),!b.st.showCloseBtn||b.st.closeBtnInside&&b.currTemplate[b.currItem.type]!==!0||b.currTemplate.closeBtn&&b.currTemplate.closeBtn.detach(),b._lastFocusedEl&&a(b._lastFocusedEl).focus(),b.currItem=null,b.content=null,b.currTemplate=null,b.prevHeight=0,y(j)},updateSize:function(a){if(b.isIOS){var c=document.documentElement.clientWidth/window.innerWidth,d=window.innerHeight*c;b.wrap.css("height",d),b.wH=d}else b.wH=a||v.height();b.fixedContentPos||b.wrap.css("height",b.wH),y("Resize")},updateItemHTML:function(){var c=b.items[b.index];b.contentContainer.detach(),b.content&&b.content.detach(),c.parsed||(c=b.parseEl(b.index));var d=c.type;if(y("BeforeChange",[b.currItem?b.currItem.type:"",d]),b.currItem=c,!b.currTemplate[d]){var f=b.st[d]?b.st[d].markup:!1;y("FirstMarkupParse",f),b.currTemplate[d]=f?a(f):!0}e&&e!==c.type&&b.container.removeClass("mfp-"+e+"-holder");var g=b["get"+d.charAt(0).toUpperCase()+d.slice(1)](c,b.currTemplate[d]);b.appendContent(g,d),c.preloaded=!0,y(n,c),e=c.type,b.container.prepend(b.contentContainer),y("AfterChange")},appendContent:function(a,c){b.content=a,a?b.st.showCloseBtn&&b.st.closeBtnInside&&b.currTemplate[c]===!0?b.content.find(".mfp-close").length||b.content.append(z()):b.content=a:b.content="",y(k),b.container.addClass("mfp-"+c+"-holder"),b.contentContainer.append(b.content)},parseEl:function(c){var d,e=b.items[c];if(e.tagName?e={el:a(e)}:(d=e.type,e={data:e,src:e.src}),e.el){for(var f=b.types,g=0;g<f.length;g++)if(e.el.hasClass("mfp-"+f[g])){d=f[g];break}e.src=e.el.attr("data-mfp-src"),e.src||(e.src=e.el.attr("href"))}return e.type=d||b.st.type||"inline",e.index=c,e.parsed=!0,b.items[c]=e,y("ElementParse",e),b.items[c]},addGroup:function(a,c){var d=function(d){d.mfpEl=this,b._openClick(d,a,c)};c||(c={});var e="click.magnificPopup";c.mainEl=a,c.items?(c.isObj=!0,a.off(e).on(e,d)):(c.isObj=!1,c.delegate?a.off(e).on(e,c.delegate,d):(c.items=a,a.off(e).on(e,d)))},_openClick:function(c,d,e){var f=void 0!==e.midClick?e.midClick:a.magnificPopup.defaults.midClick;if(f||2!==c.which&&!c.ctrlKey&&!c.metaKey){var g=void 0!==e.disableOn?e.disableOn:a.magnificPopup.defaults.disableOn;if(g)if(a.isFunction(g)){if(!g.call(b))return!0}else if(v.width()<g)return!0;c.type&&(c.preventDefault(),b.isOpen&&c.stopPropagation()),e.el=a(c.mfpEl),e.delegate&&(e.items=d.find(e.delegate)),b.open(e)}},updateStatus:function(a,d){if(b.preloader){c!==a&&b.container.removeClass("mfp-s-"+c),d||"loading"!==a||(d=b.st.tLoading);var e={status:a,text:d};y("UpdateStatus",e),a=e.status,d=e.text,b.preloader.html(d),b.preloader.find("a").on("click",function(a){a.stopImmediatePropagation()}),b.container.addClass("mfp-s-"+a),c=a}},_checkIfClose:function(c){if(!a(c).hasClass(s)){var d=b.st.closeOnContentClick,e=b.st.closeOnBgClick;if(d&&e)return!0;if(!b.content||a(c).hasClass("mfp-close")||b.preloader&&c===b.preloader[0])return!0;if(c===b.content[0]||a.contains(b.content[0],c)){if(d)return!0}else if(e&&a.contains(document,c))return!0;return!1}},_addClassToMFP:function(a){b.bgOverlay.addClass(a),b.wrap.addClass(a)},_removeClassFromMFP:function(a){this.bgOverlay.removeClass(a),b.wrap.removeClass(a)},_hasScrollBar:function(a){return(b.isIE7?d.height():document.body.scrollHeight)>(a||v.height())},_setFocus:function(){(b.st.focus?b.content.find(b.st.focus).eq(0):b.wrap).focus()},_onFocusIn:function(c){return c.target===b.wrap[0]||a.contains(b.wrap[0],c.target)?void 0:(b._setFocus(),!1)},_parseMarkup:function(b,c,d){var e;d.data&&(c=a.extend(d.data,c)),y(l,[b,c,d]),a.each(c,function(a,c){if(void 0===c||c===!1)return!0;if(e=a.split("_"),e.length>1){var d=b.find(p+"-"+e[0]);if(d.length>0){var f=e[1];"replaceWith"===f?d[0]!==c[0]&&d.replaceWith(c):"img"===f?d.is("img")?d.attr("src",c):d.replaceWith('<img src="'+c+'" class="'+d.attr("class")+'" />'):d.attr(e[1],c)}}else b.find(p+"-"+a).html(c)})},_getScrollbarSize:function(){if(void 0===b.scrollbarSize){var a=document.createElement("div");a.style.cssText="width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;",document.body.appendChild(a),b.scrollbarSize=a.offsetWidth-a.clientWidth,document.body.removeChild(a)}return b.scrollbarSize}},a.magnificPopup={instance:null,proto:t.prototype,modules:[],open:function(b,c){return A(),b=b?a.extend(!0,{},b):{},b.isObj=!0,b.index=c||0,this.instance.open(b)},close:function(){return a.magnificPopup.instance&&a.magnificPopup.instance.close()},registerModule:function(b,c){c.options&&(a.magnificPopup.defaults[b]=c.options),a.extend(this.proto,c.proto),this.modules.push(b)},defaults:{disableOn:0,key:null,midClick:!1,mainClass:"",preloader:!0,focus:"",closeOnContentClick:!1,closeOnBgClick:!0,closeBtnInside:!0,showCloseBtn:!0,enableEscapeKey:!0,modal:!1,alignTop:!1,removalDelay:0,prependTo:null,fixedContentPos:"auto",fixedBgPos:"auto",overflowY:"auto",closeMarkup:'<button title="%title%" type="button" class="mfp-close">&times;</button>',tClose:"Close (Esc)",tLoading:"Loading..."}},a.fn.magnificPopup=function(c){A();var d=a(this);if("string"==typeof c)if("open"===c){var e,f=u?d.data("magnificPopup"):d[0].magnificPopup,g=parseInt(arguments[1],10)||0;f.items?e=f.items[g]:(e=d,f.delegate&&(e=e.find(f.delegate)),e=e.eq(g)),b._openClick({mfpEl:e},d,f)}else b.isOpen&&b[c].apply(b,Array.prototype.slice.call(arguments,1));else c=a.extend(!0,{},c),u?d.data("magnificPopup",c):d[0].magnificPopup=c,b.addGroup(d,c);return d};var C,D,E,F="inline",G=function(){E&&(D.after(E.addClass(C)).detach(),E=null)};a.magnificPopup.registerModule(F,{options:{hiddenClass:"hide",markup:"",tNotFound:"Content not found"},proto:{initInline:function(){b.types.push(F),w(h+"."+F,function(){G()})},getInline:function(c,d){if(G(),c.src){var e=b.st.inline,f=a(c.src);if(f.length){var g=f[0].parentNode;g&&g.tagName&&(D||(C=e.hiddenClass,D=x(C),C="mfp-"+C),E=f.after(D).detach().removeClass(C)),b.updateStatus("ready")}else b.updateStatus("error",e.tNotFound),f=a("<div>");return c.inlineElement=f,f}return b.updateStatus("ready"),b._parseMarkup(d,{},c),d}}});var H,I="ajax",J=function(){H&&a(document.body).removeClass(H)},K=function(){J(),b.req&&b.req.abort()};a.magnificPopup.registerModule(I,{options:{settings:null,cursor:"mfp-ajax-cur",tError:'<a href="%url%">The content</a> could not be loaded.'},proto:{initAjax:function(){b.types.push(I),H=b.st.ajax.cursor,w(h+"."+I,K),w("BeforeChange."+I,K)},getAjax:function(c){H&&a(document.body).addClass(H),b.updateStatus("loading");var d=a.extend({url:c.src,success:function(d,e,f){var g={data:d,xhr:f};y("ParseAjax",g),b.appendContent(a(g.data),I),c.finished=!0,J(),b._setFocus(),setTimeout(function(){b.wrap.addClass(q)},16),b.updateStatus("ready"),y("AjaxContentAdded")},error:function(){J(),c.finished=c.loadError=!0,b.updateStatus("error",b.st.ajax.tError.replace("%url%",c.src))}},b.st.ajax.settings);return b.req=a.ajax(d),""}}});var L,M=function(c){if(c.data&&void 0!==c.data.title)return c.data.title;var d=b.st.image.titleSrc;if(d){if(a.isFunction(d))return d.call(b,c);if(c.el)return c.el.attr(d)||""}return""};a.magnificPopup.registerModule("image",{options:{markup:'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',cursor:"mfp-zoom-out-cur",titleSrc:"title",verticalFit:!0,tError:'<a href="%url%">The image</a> could not be loaded.'},proto:{initImage:function(){var c=b.st.image,d=".image";b.types.push("image"),w(m+d,function(){"image"===b.currItem.type&&c.cursor&&a(document.body).addClass(c.cursor)}),w(h+d,function(){c.cursor&&a(document.body).removeClass(c.cursor),v.off("resize"+p)}),w("Resize"+d,b.resizeImage),b.isLowIE&&w("AfterChange",b.resizeImage)},resizeImage:function(){var a=b.currItem;if(a&&a.img&&b.st.image.verticalFit){var c=0;b.isLowIE&&(c=parseInt(a.img.css("padding-top"),10)+parseInt(a.img.css("padding-bottom"),10)),a.img.css("max-height",b.wH-c)}},_onImageHasSize:function(a){a.img&&(a.hasSize=!0,L&&clearInterval(L),a.isCheckingImgSize=!1,y("ImageHasSize",a),a.imgHidden&&(b.content&&b.content.removeClass("mfp-loading"),a.imgHidden=!1))},findImageSize:function(a){var c=0,d=a.img[0],e=function(f){L&&clearInterval(L),L=setInterval(function(){return d.naturalWidth>0?void b._onImageHasSize(a):(c>200&&clearInterval(L),c++,void(3===c?e(10):40===c?e(50):100===c&&e(500)))},f)};e(1)},getImage:function(c,d){var e=0,f=function(){c&&(c.img[0].complete?(c.img.off(".mfploader"),c===b.currItem&&(b._onImageHasSize(c),b.updateStatus("ready")),c.hasSize=!0,c.loaded=!0,y("ImageLoadComplete")):(e++,200>e?setTimeout(f,100):g()))},g=function(){c&&(c.img.off(".mfploader"),c===b.currItem&&(b._onImageHasSize(c),b.updateStatus("error",h.tError.replace("%url%",c.src))),c.hasSize=!0,c.loaded=!0,c.loadError=!0)},h=b.st.image,i=d.find(".mfp-img");if(i.length){var j=document.createElement("img");j.className="mfp-img",c.el&&c.el.find("img").length&&(j.alt=c.el.find("img").attr("alt")),c.img=a(j).on("load.mfploader",f).on("error.mfploader",g),j.src=c.src,i.is("img")&&(c.img=c.img.clone()),j=c.img[0],j.naturalWidth>0?c.hasSize=!0:j.width||(c.hasSize=!1)}return b._parseMarkup(d,{title:M(c),img_replaceWith:c.img},c),b.resizeImage(),c.hasSize?(L&&clearInterval(L),c.loadError?(d.addClass("mfp-loading"),b.updateStatus("error",h.tError.replace("%url%",c.src))):(d.removeClass("mfp-loading"),b.updateStatus("ready")),d):(b.updateStatus("loading"),c.loading=!0,c.hasSize||(c.imgHidden=!0,d.addClass("mfp-loading"),b.findImageSize(c)),d)}}});var N,O=function(){return void 0===N&&(N=void 0!==document.createElement("p").style.MozTransform),N};a.magnificPopup.registerModule("zoom",{options:{enabled:!1,easing:"ease-in-out",duration:300,opener:function(a){return a.is("img")?a:a.find("img")}},proto:{initZoom:function(){var a,c=b.st.zoom,d=".zoom";if(c.enabled&&b.supportsTransition){var e,f,g=c.duration,j=function(a){var b=a.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),d="all "+c.duration/1e3+"s "+c.easing,e={position:"fixed",zIndex:9999,left:0,top:0,"-webkit-backface-visibility":"hidden"},f="transition";return e["-webkit-"+f]=e["-moz-"+f]=e["-o-"+f]=e[f]=d,b.css(e),b},k=function(){b.content.css("visibility","visible")};w("BuildControls"+d,function(){if(b._allowZoom()){if(clearTimeout(e),b.content.css("visibility","hidden"),a=b._getItemToZoom(),!a)return void k();f=j(a),f.css(b._getOffset()),b.wrap.append(f),e=setTimeout(function(){f.css(b._getOffset(!0)),e=setTimeout(function(){k(),setTimeout(function(){f.remove(),a=f=null,y("ZoomAnimationEnded")},16)},g)},16)}}),w(i+d,function(){if(b._allowZoom()){if(clearTimeout(e),b.st.removalDelay=g,!a){if(a=b._getItemToZoom(),!a)return;f=j(a)}f.css(b._getOffset(!0)),b.wrap.append(f),b.content.css("visibility","hidden"),setTimeout(function(){f.css(b._getOffset())},16)}}),w(h+d,function(){b._allowZoom()&&(k(),f&&f.remove(),a=null)})}},_allowZoom:function(){return"image"===b.currItem.type},_getItemToZoom:function(){return b.currItem.hasSize?b.currItem.img:!1},_getOffset:function(c){var d;d=c?b.currItem.img:b.st.zoom.opener(b.currItem.el||b.currItem);var e=d.offset(),f=parseInt(d.css("padding-top"),10),g=parseInt(d.css("padding-bottom"),10);e.top-=a(window).scrollTop()-f;var h={width:d.width(),height:(u?d.innerHeight():d[0].offsetHeight)-g-f};return O()?h["-moz-transform"]=h.transform="translate("+e.left+"px,"+e.top+"px)":(h.left=e.left,h.top=e.top),h}}});var P="iframe",Q="//about:blank",R=function(a){if(b.currTemplate[P]){var c=b.currTemplate[P].find("iframe");c.length&&(a||(c[0].src=Q),b.isIE8&&c.css("display",a?"block":"none"))}};a.magnificPopup.registerModule(P,{options:{markup:'<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',srcAction:"iframe_src",patterns:{youtube:{index:"youtube.com",id:"v=",src:"//www.youtube.com/embed/%id%?autoplay=1"},vimeo:{index:"vimeo.com/",id:"/",src:"//player.vimeo.com/video/%id%?autoplay=1"},gmaps:{index:"//maps.google.",src:"%id%&output=embed"}}},proto:{initIframe:function(){b.types.push(P),w("BeforeChange",function(a,b,c){b!==c&&(b===P?R():c===P&&R(!0))}),w(h+"."+P,function(){R()})},getIframe:function(c,d){var e=c.src,f=b.st.iframe;a.each(f.patterns,function(){return e.indexOf(this.index)>-1?(this.id&&(e="string"==typeof this.id?e.substr(e.lastIndexOf(this.id)+this.id.length,e.length):this.id.call(this,e)),e=this.src.replace("%id%",e),!1):void 0});var g={};return f.srcAction&&(g[f.srcAction]=e),b._parseMarkup(d,g,c),b.updateStatus("ready"),d}}});var S=function(a){var c=b.items.length;return a>c-1?a-c:0>a?c+a:a},T=function(a,b,c){return a.replace(/%curr%/gi,b+1).replace(/%total%/gi,c)};a.magnificPopup.registerModule("gallery",{options:{enabled:!1,arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',preload:[0,2],navigateByImgClick:!0,arrows:!0,tPrev:"Previous (Left arrow key)",tNext:"Next (Right arrow key)",tCounter:"%curr% of %total%"},proto:{initGallery:function(){var c=b.st.gallery,e=".mfp-gallery",g=Boolean(a.fn.mfpFastClick);return b.direction=!0,c&&c.enabled?(f+=" mfp-gallery",w(m+e,function(){c.navigateByImgClick&&b.wrap.on("click"+e,".mfp-img",function(){return b.items.length>1?(b.next(),!1):void 0}),d.on("keydown"+e,function(a){37===a.keyCode?b.prev():39===a.keyCode&&b.next()})}),w("UpdateStatus"+e,function(a,c){c.text&&(c.text=T(c.text,b.currItem.index,b.items.length))}),w(l+e,function(a,d,e,f){var g=b.items.length;e.counter=g>1?T(c.tCounter,f.index,g):""}),w("BuildControls"+e,function(){if(b.items.length>1&&c.arrows&&!b.arrowLeft){var d=c.arrowMarkup,e=b.arrowLeft=a(d.replace(/%title%/gi,c.tPrev).replace(/%dir%/gi,"left")).addClass(s),f=b.arrowRight=a(d.replace(/%title%/gi,c.tNext).replace(/%dir%/gi,"right")).addClass(s),h=g?"mfpFastClick":"click";e[h](function(){b.prev()}),f[h](function(){b.next()}),b.isIE7&&(x("b",e[0],!1,!0),x("a",e[0],!1,!0),x("b",f[0],!1,!0),x("a",f[0],!1,!0)),b.container.append(e.add(f))}}),w(n+e,function(){b._preloadTimeout&&clearTimeout(b._preloadTimeout),b._preloadTimeout=setTimeout(function(){b.preloadNearbyImages(),b._preloadTimeout=null},16)}),void w(h+e,function(){d.off(e),b.wrap.off("click"+e),b.arrowLeft&&g&&b.arrowLeft.add(b.arrowRight).destroyMfpFastClick(),b.arrowRight=b.arrowLeft=null})):!1},next:function(){b.direction=!0,b.index=S(b.index+1),b.updateItemHTML()},prev:function(){b.direction=!1,b.index=S(b.index-1),b.updateItemHTML()},goTo:function(a){b.direction=a>=b.index,b.index=a,b.updateItemHTML()},preloadNearbyImages:function(){var a,c=b.st.gallery.preload,d=Math.min(c[0],b.items.length),e=Math.min(c[1],b.items.length);for(a=1;a<=(b.direction?e:d);a++)b._preloadItem(b.index+a);for(a=1;a<=(b.direction?d:e);a++)b._preloadItem(b.index-a)},_preloadItem:function(c){if(c=S(c),!b.items[c].preloaded){var d=b.items[c];d.parsed||(d=b.parseEl(c)),y("LazyLoad",d),"image"===d.type&&(d.img=a('<img class="mfp-img" />').on("load.mfploader",function(){d.hasSize=!0}).on("error.mfploader",function(){d.hasSize=!0,d.loadError=!0,y("LazyLoadError",d)}).attr("src",d.src)),d.preloaded=!0}}}});var U="retina";a.magnificPopup.registerModule(U,{options:{replaceSrc:function(a){return a.src.replace(/\.\w+$/,function(a){return"@2x"+a})},ratio:1},proto:{initRetina:function(){if(window.devicePixelRatio>1){var a=b.st.retina,c=a.ratio;c=isNaN(c)?c():c,c>1&&(w("ImageHasSize."+U,function(a,b){b.img.css({"max-width":b.img[0].naturalWidth/c,width:"100%"})}),w("ElementParse."+U,function(b,d){d.src=a.replaceSrc(d,c)}))}}}}),function(){var b=1e3,c="ontouchstart"in window,d=function(){v.off("touchmove"+f+" touchend"+f)},e="mfpFastClick",f="."+e;a.fn.mfpFastClick=function(e){return a(this).each(function(){var g,h=a(this);if(c){var i,j,k,l,m,n;h.on("touchstart"+f,function(a){l=!1,n=1,m=a.originalEvent?a.originalEvent.touches[0]:a.touches[0],j=m.clientX,k=m.clientY,v.on("touchmove"+f,function(a){m=a.originalEvent?a.originalEvent.touches:a.touches,n=m.length,m=m[0],(Math.abs(m.clientX-j)>10||Math.abs(m.clientY-k)>10)&&(l=!0,d())}).on("touchend"+f,function(a){d(),l||n>1||(g=!0,a.preventDefault(),clearTimeout(i),i=setTimeout(function(){g=!1},b),e())})})}h.on("click"+f,function(){g||e()})})},a.fn.destroyMfpFastClick=function(){a(this).off("touchstart"+f+" click"+f),c&&v.off("touchmove"+f+" touchend"+f)}}(),A()});


/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});


/**
 * Featherlight - ultra slim jQuery lightbox
 * Version 1.7.1 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2017, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
!function(a){"use strict";function b(a,c){if(!(this instanceof b)){var d=new b(a,c);return d.open(),d}this.id=b.id++,this.setup(a,c),this.chainCallbacks(b._callbackChain)}function c(a,b){var c={};for(var d in a)d in b&&(c[d]=a[d],delete a[d]);return c}function d(a,b){var c={},d=new RegExp("^"+b+"([A-Z])(.*)");for(var e in a){var f=e.match(d);if(f){var g=(f[1]+f[2].replace(/([A-Z])/g,"-$1")).toLowerCase();c[g]=a[e]}}return c}if("undefined"==typeof a)return void("console"in window&&window.console.info("Too much lightness, Featherlight needs jQuery."));var e=[],f=function(b){return e=a.grep(e,function(a){return a!==b&&a.$instance.closest("body").length>0})},g={allowfullscreen:1,frameborder:1,height:1,longdesc:1,marginheight:1,marginwidth:1,name:1,referrerpolicy:1,scrolling:1,sandbox:1,src:1,srcdoc:1,width:1},h={keyup:"onKeyUp",resize:"onResize"},i=function(c){a.each(b.opened().reverse(),function(){return c.isDefaultPrevented()||!1!==this[h[c.type]](c)?void 0:(c.preventDefault(),c.stopPropagation(),!1)})},j=function(c){if(c!==b._globalHandlerInstalled){b._globalHandlerInstalled=c;var d=a.map(h,function(a,c){return c+"."+b.prototype.namespace}).join(" ");a(window)[c?"on":"off"](d,i)}};b.prototype={constructor:b,namespace:"featherlight",targetAttr:"data-featherlight",variant:null,resetCss:!1,background:null,openTrigger:"click",closeTrigger:"click",filter:null,root:"body",openSpeed:250,closeSpeed:250,closeOnClick:"background",closeOnEsc:!0,closeIcon:"&#10005;",loading:"",persist:!1,otherClose:null,beforeOpen:a.noop,beforeContent:a.noop,beforeClose:a.noop,afterOpen:a.noop,afterContent:a.noop,afterClose:a.noop,onKeyUp:a.noop,onResize:a.noop,type:null,contentFilters:["jquery","image","html","ajax","iframe","text"],setup:function(b,c){"object"!=typeof b||b instanceof a!=!1||c||(c=b,b=void 0);var d=a.extend(this,c,{target:b}),e=d.resetCss?d.namespace+"-reset":d.namespace,f=a(d.background||['<div class="'+e+"-loading "+e+'">','<div class="'+e+'-content">','<button class="'+e+"-close-icon "+d.namespace+'-close" aria-label="Close">',d.closeIcon,"</button>",'<div class="'+d.namespace+'-inner">'+d.loading+"</div>","</div>","</div>"].join("")),g="."+d.namespace+"-close"+(d.otherClose?","+d.otherClose:"");return d.$instance=f.clone().addClass(d.variant),d.$instance.on(d.closeTrigger+"."+d.namespace,function(b){var c=a(b.target);("background"===d.closeOnClick&&c.is("."+d.namespace)||"anywhere"===d.closeOnClick||c.closest(g).length)&&(d.close(b),b.preventDefault())}),this},getContent:function(){if(this.persist!==!1&&this.$content)return this.$content;var b=this,c=this.constructor.contentFilters,d=function(a){return b.$currentTarget&&b.$currentTarget.attr(a)},e=d(b.targetAttr),f=b.target||e||"",g=c[b.type];if(!g&&f in c&&(g=c[f],f=b.target&&e),f=f||d("href")||"",!g)for(var h in c)b[h]&&(g=c[h],f=b[h]);if(!g){var i=f;if(f=null,a.each(b.contentFilters,function(){return g=c[this],g.test&&(f=g.test(i)),!f&&g.regex&&i.match&&i.match(g.regex)&&(f=i),!f}),!f)return"console"in window&&window.console.error("Featherlight: no content filter found "+(i?' for "'+i+'"':" (no target specified)")),!1}return g.process.call(b,f)},setContent:function(b){var c=this;return b.is("iframe")&&c.$instance.addClass(c.namespace+"-iframe"),c.$instance.removeClass(c.namespace+"-loading"),c.$instance.find("."+c.namespace+"-inner").not(b).slice(1).remove().end().replaceWith(a.contains(c.$instance[0],b[0])?"":b),c.$content=b.addClass(c.namespace+"-inner"),c},open:function(b){var c=this;if(c.$instance.hide().appendTo(c.root),!(b&&b.isDefaultPrevented()||c.beforeOpen(b)===!1)){b&&b.preventDefault();var d=c.getContent();if(d)return e.push(c),j(!0),c.$instance.fadeIn(c.openSpeed),c.beforeContent(b),a.when(d).always(function(a){c.setContent(a),c.afterContent(b)}).then(c.$instance.promise()).done(function(){c.afterOpen(b)})}return c.$instance.detach(),a.Deferred().reject().promise()},close:function(b){var c=this,d=a.Deferred();return c.beforeClose(b)===!1?d.reject():(0===f(c).length&&j(!1),c.$instance.fadeOut(c.closeSpeed,function(){c.$instance.detach(),c.afterClose(b),d.resolve()})),d.promise()},resize:function(a,b){if(a&&b){this.$content.css("width","").css("height","");var c=Math.max(a/(parseInt(this.$content.parent().css("width"),10)-1),b/(parseInt(this.$content.parent().css("height"),10)-1));c>1&&(c=b/Math.floor(b/c),this.$content.css("width",""+a/c+"px").css("height",""+b/c+"px"))}},chainCallbacks:function(b){for(var c in b)this[c]=a.proxy(b[c],this,a.proxy(this[c],this))}},a.extend(b,{id:0,autoBind:"[data-featherlight]",defaults:b.prototype,contentFilters:{jquery:{regex:/^[#.]\w/,test:function(b){return b instanceof a&&b},process:function(b){return this.persist!==!1?a(b):a(b).clone(!0)}},image:{regex:/\.(png|jpg|jpeg|gif|tiff|bmp|svg)(\?\S*)?$/i,process:function(b){var c=this,d=a.Deferred(),e=new Image,f=a('<img src="'+b+'" alt="" class="'+c.namespace+'-image" />');return e.onload=function(){f.naturalWidth=e.width,f.naturalHeight=e.height,d.resolve(f)},e.onerror=function(){d.reject(f)},e.src=b,d.promise()}},html:{regex:/^\s*<[\w!][^<]*>/,process:function(b){return a(b)}},ajax:{regex:/./,process:function(b){var c=a.Deferred(),d=a("<div></div>").load(b,function(a,b){"error"!==b&&c.resolve(d.contents()),c.fail()});return c.promise()}},iframe:{process:function(b){var e=new a.Deferred,f=a("<iframe/>"),h=d(this,"iframe"),i=c(h,g);return f.hide().attr("src",b).attr(i).css(h).on("load",function(){e.resolve(f.show())}).appendTo(this.$instance.find("."+this.namespace+"-content")),e.promise()}},text:{process:function(b){return a("<div>",{text:b})}}},functionAttributes:["beforeOpen","afterOpen","beforeContent","afterContent","beforeClose","afterClose"],readElementConfig:function(b,c){var d=this,e=new RegExp("^data-"+c+"-(.*)"),f={};return b&&b.attributes&&a.each(b.attributes,function(){var b=this.name.match(e);if(b){var c=this.value,g=a.camelCase(b[1]);if(a.inArray(g,d.functionAttributes)>=0)c=new Function(c);else try{c=JSON.parse(c)}catch(h){}f[g]=c}}),f},extend:function(b,c){var d=function(){this.constructor=b};return d.prototype=this.prototype,b.prototype=new d,b.__super__=this.prototype,a.extend(b,this,c),b.defaults=b.prototype,b},attach:function(b,c,d){var e=this;"object"!=typeof c||c instanceof a!=!1||d||(d=c,c=void 0),d=a.extend({},d);var f,g=d.namespace||e.defaults.namespace,h=a.extend({},e.defaults,e.readElementConfig(b[0],g),d),i=function(g){var i=a.extend({$source:b,$currentTarget:a(this)},e.readElementConfig(b[0],h.namespace),e.readElementConfig(this,h.namespace),d),j=f||a(this).data("featherlight-persisted")||new e(c,i);"shared"===j.persist?f=j:j.persist!==!1&&a(this).data("featherlight-persisted",j),i.$currentTarget.blur(),j.open(g)};return b.on(h.openTrigger+"."+h.namespace,h.filter,i),i},current:function(){var a=this.opened();return a[a.length-1]||null},opened:function(){var b=this;return f(),a.grep(e,function(a){return a instanceof b})},close:function(a){var b=this.current();return b?b.close(a):void 0},_onReady:function(){var b=this;b.autoBind&&(a(b.autoBind).each(function(){b.attach(a(this))}),a(document).on("click",b.autoBind,function(c){if(!c.isDefaultPrevented()){var d=b.attach(a(c.currentTarget));d(c)}}))},_callbackChain:{onKeyUp:function(b,c){return 27===c.keyCode?(this.closeOnEsc&&a.featherlight.close(c),!1):b(c)},beforeOpen:function(b,c){return this._previouslyActive=document.activeElement,this._$previouslyTabbable=a("a, input, select, textarea, iframe, button, iframe, [contentEditable=true]").not("[tabindex]").not(this.$instance.find("button")),this._$previouslyWithTabIndex=a("[tabindex]").not('[tabindex="-1"]'),this._previousWithTabIndices=this._$previouslyWithTabIndex.map(function(b,c){return a(c).attr("tabindex")}),this._$previouslyWithTabIndex.add(this._$previouslyTabbable).attr("tabindex",-1),document.activeElement.blur(),b(c)},afterClose:function(b,c){var d=b(c),e=this;return this._$previouslyTabbable.removeAttr("tabindex"),this._$previouslyWithTabIndex.each(function(b,c){a(c).attr("tabindex",e._previousWithTabIndices[b])}),this._previouslyActive.focus(),d},onResize:function(a,b){return this.resize(this.$content.naturalWidth,this.$content.naturalHeight),a(b)},afterContent:function(a,b){var c=a(b);return this.$instance.find("[autofocus]:not([disabled])").focus(),this.onResize(b),c}}}),a.featherlight=b,a.fn.featherlight=function(a,c){return b.attach(this,a,c),this},a(document).ready(function(){b._onReady()})}(jQuery);


/*! WOW - v1.1.2 - 2015-08-19
* Copyright (c) 2015 Matthieu Aussaguel; Licensed MIT */
(function(){var a,b,c,d,e,f=function(a,b){return function(){return a.apply(b,arguments)}},g=[].indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(b in this&&this[b]===a)return b;return-1};b=function(){function a(){}return a.prototype.extend=function(a,b){var c,d;for(c in b)d=b[c],null==a[c]&&(a[c]=d);return a},a.prototype.isMobile=function(a){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(a)},a.prototype.createEvent=function(a,b,c,d){var e;return null==b&&(b=!1),null==c&&(c=!1),null==d&&(d=null),null!=document.createEvent?(e=document.createEvent("CustomEvent"),e.initCustomEvent(a,b,c,d)):null!=document.createEventObject?(e=document.createEventObject(),e.eventType=a):e.eventName=a,e},a.prototype.emitEvent=function(a,b){return null!=a.dispatchEvent?a.dispatchEvent(b):b in(null!=a)?a[b]():"on"+b in(null!=a)?a["on"+b]():void 0},a.prototype.addEvent=function(a,b,c){return null!=a.addEventListener?a.addEventListener(b,c,!1):null!=a.attachEvent?a.attachEvent("on"+b,c):a[b]=c},a.prototype.removeEvent=function(a,b,c){return null!=a.removeEventListener?a.removeEventListener(b,c,!1):null!=a.detachEvent?a.detachEvent("on"+b,c):delete a[b]},a.prototype.innerHeight=function(){return"innerHeight"in window?window.innerHeight:document.documentElement.clientHeight},a}(),c=this.WeakMap||this.MozWeakMap||(c=function(){function a(){this.keys=[],this.values=[]}return a.prototype.get=function(a){var b,c,d,e,f;for(f=this.keys,b=d=0,e=f.length;e>d;b=++d)if(c=f[b],c===a)return this.values[b]},a.prototype.set=function(a,b){var c,d,e,f,g;for(g=this.keys,c=e=0,f=g.length;f>e;c=++e)if(d=g[c],d===a)return void(this.values[c]=b);return this.keys.push(a),this.values.push(b)},a}()),a=this.MutationObserver||this.WebkitMutationObserver||this.MozMutationObserver||(a=function(){function a(){"undefined"!=typeof console&&null!==console&&console.warn("MutationObserver is not supported by your browser."),"undefined"!=typeof console&&null!==console&&console.warn("WOW.js cannot detect dom mutations, please call .sync() after loading new content.")}return a.notSupported=!0,a.prototype.observe=function(){},a}()),d=this.getComputedStyle||function(a){return this.getPropertyValue=function(b){var c;return"float"===b&&(b="styleFloat"),e.test(b)&&b.replace(e,function(a,b){return b.toUpperCase()}),(null!=(c=a.currentStyle)?c[b]:void 0)||null},this},e=/(\-([a-z]){1})/g,this.WOW=function(){function e(a){null==a&&(a={}),this.scrollCallback=f(this.scrollCallback,this),this.scrollHandler=f(this.scrollHandler,this),this.resetAnimation=f(this.resetAnimation,this),this.start=f(this.start,this),this.scrolled=!0,this.config=this.util().extend(a,this.defaults),null!=a.scrollContainer&&(this.config.scrollContainer=document.querySelector(a.scrollContainer)),this.animationNameCache=new c,this.wowEvent=this.util().createEvent(this.config.boxClass)}return e.prototype.defaults={boxClass:"wow",animateClass:"animated",offset:0,mobile:!0,live:!0,callback:null,scrollContainer:null},e.prototype.init=function(){var a;return this.element=window.document.documentElement,"interactive"===(a=document.readyState)||"complete"===a?this.start():this.util().addEvent(document,"DOMContentLoaded",this.start),this.finished=[]},e.prototype.start=function(){var b,c,d,e;if(this.stopped=!1,this.boxes=function(){var a,c,d,e;for(d=this.element.querySelectorAll("."+this.config.boxClass),e=[],a=0,c=d.length;c>a;a++)b=d[a],e.push(b);return e}.call(this),this.all=function(){var a,c,d,e;for(d=this.boxes,e=[],a=0,c=d.length;c>a;a++)b=d[a],e.push(b);return e}.call(this),this.boxes.length)if(this.disabled())this.resetStyle();else for(e=this.boxes,c=0,d=e.length;d>c;c++)b=e[c],this.applyStyle(b,!0);return this.disabled()||(this.util().addEvent(this.config.scrollContainer||window,"scroll",this.scrollHandler),this.util().addEvent(window,"resize",this.scrollHandler),this.interval=setInterval(this.scrollCallback,50)),this.config.live?new a(function(a){return function(b){var c,d,e,f,g;for(g=[],c=0,d=b.length;d>c;c++)f=b[c],g.push(function(){var a,b,c,d;for(c=f.addedNodes||[],d=[],a=0,b=c.length;b>a;a++)e=c[a],d.push(this.doSync(e));return d}.call(a));return g}}(this)).observe(document.body,{childList:!0,subtree:!0}):void 0},e.prototype.stop=function(){return this.stopped=!0,this.util().removeEvent(this.config.scrollContainer||window,"scroll",this.scrollHandler),this.util().removeEvent(window,"resize",this.scrollHandler),null!=this.interval?clearInterval(this.interval):void 0},e.prototype.sync=function(){return a.notSupported?this.doSync(this.element):void 0},e.prototype.doSync=function(a){var b,c,d,e,f;if(null==a&&(a=this.element),1===a.nodeType){for(a=a.parentNode||a,e=a.querySelectorAll("."+this.config.boxClass),f=[],c=0,d=e.length;d>c;c++)b=e[c],g.call(this.all,b)<0?(this.boxes.push(b),this.all.push(b),this.stopped||this.disabled()?this.resetStyle():this.applyStyle(b,!0),f.push(this.scrolled=!0)):f.push(void 0);return f}},e.prototype.show=function(a){return this.applyStyle(a),a.className=a.className+" "+this.config.animateClass,null!=this.config.callback&&this.config.callback(a),this.util().emitEvent(a,this.wowEvent),this.util().addEvent(a,"animationend",this.resetAnimation),this.util().addEvent(a,"oanimationend",this.resetAnimation),this.util().addEvent(a,"webkitAnimationEnd",this.resetAnimation),this.util().addEvent(a,"MSAnimationEnd",this.resetAnimation),a},e.prototype.applyStyle=function(a,b){var c,d,e;return d=a.getAttribute("data-wow-duration"),c=a.getAttribute("data-wow-delay"),e=a.getAttribute("data-wow-iteration"),this.animate(function(f){return function(){return f.customStyle(a,b,d,c,e)}}(this))},e.prototype.animate=function(){return"requestAnimationFrame"in window?function(a){return window.requestAnimationFrame(a)}:function(a){return a()}}(),e.prototype.resetStyle=function(){var a,b,c,d,e;for(d=this.boxes,e=[],b=0,c=d.length;c>b;b++)a=d[b],e.push(a.style.visibility="visible");return e},e.prototype.resetAnimation=function(a){var b;return a.type.toLowerCase().indexOf("animationend")>=0?(b=a.target||a.srcElement,b.className=b.className.replace(this.config.animateClass,"").trim()):void 0},e.prototype.customStyle=function(a,b,c,d,e){return b&&this.cacheAnimationName(a),a.style.visibility=b?"hidden":"visible",c&&this.vendorSet(a.style,{animationDuration:c}),d&&this.vendorSet(a.style,{animationDelay:d}),e&&this.vendorSet(a.style,{animationIterationCount:e}),this.vendorSet(a.style,{animationName:b?"none":this.cachedAnimationName(a)}),a},e.prototype.vendors=["moz","webkit"],e.prototype.vendorSet=function(a,b){var c,d,e,f;d=[];for(c in b)e=b[c],a[""+c]=e,d.push(function(){var b,d,g,h;for(g=this.vendors,h=[],b=0,d=g.length;d>b;b++)f=g[b],h.push(a[""+f+c.charAt(0).toUpperCase()+c.substr(1)]=e);return h}.call(this));return d},e.prototype.vendorCSS=function(a,b){var c,e,f,g,h,i;for(h=d(a),g=h.getPropertyCSSValue(b),f=this.vendors,c=0,e=f.length;e>c;c++)i=f[c],g=g||h.getPropertyCSSValue("-"+i+"-"+b);return g},e.prototype.animationName=function(a){var b;try{b=this.vendorCSS(a,"animation-name").cssText}catch(c){b=d(a).getPropertyValue("animation-name")}return"none"===b?"":b},e.prototype.cacheAnimationName=function(a){return this.animationNameCache.set(a,this.animationName(a))},e.prototype.cachedAnimationName=function(a){return this.animationNameCache.get(a)},e.prototype.scrollHandler=function(){return this.scrolled=!0},e.prototype.scrollCallback=function(){var a;return!this.scrolled||(this.scrolled=!1,this.boxes=function(){var b,c,d,e;for(d=this.boxes,e=[],b=0,c=d.length;c>b;b++)a=d[b],a&&(this.isVisible(a)?this.show(a):e.push(a));return e}.call(this),this.boxes.length||this.config.live)?void 0:this.stop()},e.prototype.offsetTop=function(a){for(var b;void 0===a.offsetTop;)a=a.parentNode;for(b=a.offsetTop;a=a.offsetParent;)b+=a.offsetTop;return b},e.prototype.isVisible=function(a){var b,c,d,e,f;return c=a.getAttribute("data-wow-offset")||this.config.offset,f=this.config.scrollContainer&&this.config.scrollContainer.scrollTop||window.pageYOffset,e=f+Math.min(this.element.clientHeight,this.util().innerHeight())-c,d=this.offsetTop(a),b=d+a.clientHeight,e>=d&&b>=f},e.prototype.util=function(){return null!=this._util?this._util:this._util=new b},e.prototype.disabled=function(){return!this.config.mobile&&this.util().isMobile(navigator.userAgent)},e}()}).call(this);


/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*! autotrack.js v0.5.0 */
// !function t(e,i,n){function r(o,s){if(!i[o]){if(!e[o]){var u="function"==typeof require&&require;if(!s&&u)return u(o,!0);if(a)return a(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var d=i[o]={exports:{}};e[o][0].call(d.exports,function(t){var i=e[o][1][t];return r(i?i:t)},d,d.exports,t,e,i,n)}return i[o].exports}for(var a="function"==typeof require&&require,o=0;o<n.length;o++)r(n[o]);return r}({1:[function(t,e,i){e.exports={DEV_ID:"i5iSjo"}},{}],2:[function(t,e,i){function n(t,e){if(window.gaplugins=window.gaplugins||{},gaplugins.EventTracker=n,window.addEventListener){this.opts=a(e,{attributePrefix:"data-"}),this.tracker=t;var i=this.opts.attributePrefix,o="["+i+"event-category]["+i+"event-action]";r(document,o,"click",this.handleEventClicks.bind(this))}}var r=t("delegate"),a=t("../utilities").defaults,o=t("../provide");n.prototype.handleEventClicks=function(t){var e=t.delegateTarget,i=this.opts.attributePrefix;this.tracker.send("event",{eventCategory:e.getAttribute(i+"event-category"),eventAction:e.getAttribute(i+"event-action"),eventLabel:e.getAttribute(i+"event-label"),eventValue:e.getAttribute(i+"event-value")})},o("eventTracker",n)},{"../provide":9,"../utilities":10,delegate:14}],3:[function(t,e,i){function n(t,e){window.gaplugins=window.gaplugins||{},gaplugins.MediaQueryTracker=n,window.matchMedia&&(this.opts=o(e,{mediaQueryDefinitions:!1,mediaQueryChangeTemplate:this.changeTemplate,mediaQueryChangeTimeout:1e3}),s(this.opts.mediaQueryDefinitions)&&(this.opts.mediaQueryDefinitions=u(this.opts.mediaQueryDefinitions),this.tracker=t,this.timeouts={},this.processMediaQueries()))}function r(t){return l[t]?l[t]:(l[t]=window.matchMedia(t),l[t])}var a=t("debounce"),o=t("../utilities").defaults,s=t("../utilities").isObject,u=t("../utilities").toArray,c=t("../provide"),d="(not set)",l={};n.prototype.processMediaQueries=function(){this.opts.mediaQueryDefinitions.forEach(function(t){if(!t.dimensionIndex)throw new Error("Media query definitions must have a name.");if(!t.dimensionIndex)throw new Error("Media query definitions must have a dimension index.");var e=this.getMatchName(t);this.tracker.set("dimension"+t.dimensionIndex,e),this.addChangeListeners(t)}.bind(this))},n.prototype.getMatchName=function(t){var e;return t.items.forEach(function(t){r(t.media).matches&&(e=t)}),e?e.name:d},n.prototype.addChangeListeners=function(t){t.items.forEach(function(e){var i=r(e.media);i.addListener(a(function(){this.handleChanges(t)}.bind(this),this.opts.mediaQueryChangeTimeout))}.bind(this))},n.prototype.handleChanges=function(t){var e=this.getMatchName(t),i=this.tracker.get("dimension"+t.dimensionIndex);e!==i&&(this.tracker.set("dimension"+t.dimensionIndex,e),this.tracker.send("event",t.name,"change",this.opts.mediaQueryChangeTemplate(i,e)))},n.prototype.changeTemplate=function(t,e){return t+" => "+e},c("mediaQueryTracker",n)},{"../provide":9,"../utilities":10,debounce:13}],4:[function(t,e,i){function n(t,e){window.gaplugins=window.gaplugins||{},gaplugins.OutboundFormTracker=n,window.addEventListener&&(this.opts=r(e,{shouldTrackOutboundForm:this.shouldTrackOutboundForm}),this.tracker=t,a(document,"form","submit",this.handleFormSubmits.bind(this)))}var r=t("../utilities").defaults,a=t("delegate"),o=t("../provide"),s=t("../utilities");n.prototype.handleFormSubmits=function(t){var e=t.delegateTarget,i=e.getAttribute("action"),n={transport:"beacon"};this.opts.shouldTrackOutboundForm(e)&&(navigator.sendBeacon||(t.preventDefault(),n.hitCallback=s.withTimeout(function(){e.submit()})),this.tracker.send("event","Outbound Form","submit",i,n))},n.prototype.shouldTrackOutboundForm=function(t){var e=t.getAttribute("action");return 0===e.indexOf("http")&&e.indexOf(location.hostname)<0},o("outboundFormTracker",n)},{"../provide":9,"../utilities":10,delegate:14}],5:[function(t,e,i){function n(t,e){window.gaplugins=window.gaplugins||{},gaplugins.OutboundLinkTracker=n,window.addEventListener&&(this.opts=r(e,{shouldTrackOutboundLink:this.shouldTrackOutboundLink}),this.tracker=t,a(document,"a","click",this.handleLinkClicks.bind(this)))}var r=t("../utilities").defaults,a=t("delegate"),o=t("../provide");n.prototype.handleLinkClicks=function(t){var e=t.delegateTarget;this.opts.shouldTrackOutboundLink(e)&&(navigator.sendBeacon||(e.target="_blank"),this.tracker.send("event","Outbound Link","click",e.href,{transport:"beacon"}))},n.prototype.shouldTrackOutboundLink=function(t){return t.hostname!=location.hostname},o("outboundLinkTracker",n)},{"../provide":9,"../utilities":10,delegate:14}],6:[function(t,e,i){function n(t,e){window.gaplugins=window.gaplugins||{},gaplugins.SessionDurationTracker=n,window.addEventListener&&(this.opts=r(e),this.tracker=t,window.addEventListener("unload",this.handleWindowUnload.bind(this)))}var r=t("../utilities").defaults,a=t("../provide");n.prototype.handleWindowUnload=function(){var t={nonInteraction:!0,transport:"beacon"};window.performance&&performance.timing&&(t.eventValue=+new Date-performance.timing.navigationStart),this.tracker.send("event","Window","unload",t)},a("sessionDurationTracker",n)},{"../provide":9,"../utilities":10}],7:[function(t,e,i){function n(t,e){if(window.gaplugins=window.gaplugins||{},gaplugins.SocialTracker=n,window.addEventListener){this.opts=r(e,{attributePrefix:"data-"}),this.tracker=t;var i=this.opts.attributePrefix,o="["+i+"social-network]["+i+"social-action]["+i+"social-target]";a(document,o,"click",this.handleSocialClicks.bind(this)),this.detectLibraryLoad("FB","facebook-jssdk",this.addFacebookEventHandlers.bind(this)),this.detectLibraryLoad("twttr","twitter-wjs",this.addTwitterEventHandlers.bind(this))}}var r=t("../utilities").defaults,a=t("delegate"),o=t("../provide");n.prototype.handleSocialClicks=function(t){var e=t.delegateTarget,i=this.opts.attributePrefix;this.tracker.send("social",{socialNetwork:e.getAttribute(i+"social-network"),socialAction:e.getAttribute(i+"social-action"),socialTarget:e.getAttribute(i+"social-target")})},n.prototype.detectLibraryLoad=function(t,e,i){if(window[t])i();else{var n=document.getElementById(e);n&&(n.onload=i)}},n.prototype.addTwitterEventHandlers=function(){try{twttr.ready(function(){twttr.events.bind("tweet",function(t){if("tweet"==t.region){var e=t.data.url||t.target.getAttribute("data-url")||location.href;this.tracker.send("social","Twitter","tweet",e)}}.bind(this)),twttr.events.bind("follow",function(t){if("follow"==t.region){var e=t.data.screen_name||t.target.getAttribute("data-screen-name");this.tracker.send("social","Twitter","follow",e)}}.bind(this))}.bind(this))}catch(t){}},n.prototype.addFacebookEventHandlers=function(){try{FB.Event.subscribe("edge.create",function(t){this.tracker.send("social","Facebook","like",t)}.bind(this)),FB.Event.subscribe("edge.remove",function(t){this.tracker.send("social","Facebook","unlike",t)}.bind(this))}catch(t){}},o("socialTracker",n)},{"../provide":9,"../utilities":10,delegate:14}],8:[function(t,e,i){function n(t,e){if(window.gaplugins=window.gaplugins||{},gaplugins.UrlChangeTracker=n,history.pushState&&window.addEventListener){this.opts=a(e,{shouldTrackUrlChange:this.shouldTrackUrlChange}),this.tracker=t,this.path=r();var i=history.pushState;history.pushState=function(t,e,n){o(t)&&e&&(t.title=e),i.call(history,t,e,n),this.updateTrackerData()}.bind(this);var s=history.replaceState;history.replaceState=function(t,e,i){o(t)&&e&&(t.title=e),s.call(history,t,e,i),this.updateTrackerData(!1)}.bind(this),window.addEventListener("popstate",this.updateTrackerData.bind(this))}}function r(){return location.pathname+location.search}var a=t("../utilities").defaults,o=t("../utilities").isObject,s=t("../provide");n.prototype.updateTrackerData=function(t){t=t===!1?!1:!0,setTimeout(function(){var e=this.path,i=r();e!=i&&this.opts.shouldTrackUrlChange.call(this,i,e)&&(this.path=i,this.tracker.set({page:i,title:o(history.state)&&history.state.title||document.title}),t&&this.tracker.send("pageview"))}.bind(this),0)},n.prototype.shouldTrackUrlChange=function(t,e){return!0},s("urlChangeTracker",n)},{"../provide":9,"../utilities":10}],9:[function(t,e,i){var n=t("./constants");(window.gaDevIds=window.gaDevIds||[]).push(n.DEV_ID),e.exports=function(t,e){var i=window[window.GoogleAnalyticsObject||"ga"];"function"==typeof i&&i("provide",t,e)}},{"./constants":1}],10:[function(t,e,i){var n={withTimeout:function(t,e){var i=!1;return setTimeout(t,e||2e3),function(){i||(i=!0,t())}},defaults:function(t,e){var i={};"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});for(var n in e)e.hasOwnProperty(n)&&(i[n]=t.hasOwnProperty(n)?t[n]:e[n]);return i},isObject:function(t){return"object"==typeof t&&null!==t},isArray:Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},toArray:function(t){return n.isArray(t)?t:[t]}};e.exports=n},{}],11:[function(t,e,i){var n=t("matches-selector");e.exports=function(t,e,i){for(var r=i?t:t.parentNode;r&&r!==document;){if(n(r,e))return r;r=r.parentNode}}},{"matches-selector":15}],12:[function(t,e,i){function n(){return(new Date).getTime()}e.exports=Date.now||n},{}],13:[function(t,e,i){var n=t("date-now");e.exports=function(t,e,i){function r(){var d=n()-u;e>d&&d>0?a=setTimeout(r,e-d):(a=null,i||(c=t.apply(s,o),a||(s=o=null)))}var a,o,s,u,c;return null==e&&(e=100),function(){s=this,o=arguments,u=n();var d=i&&!a;return a||(a=setTimeout(r,e)),d&&(c=t.apply(s,o),s=o=null),c}}},{"date-now":12}],14:[function(t,e,i){function n(t,e,i,n,a){var o=r.apply(this,arguments);return t.addEventListener(i,o,a),{destroy:function(){t.removeEventListener(i,o,a)}}}function r(t,e,i,n){return function(i){i.delegateTarget=a(i.target,e,!0),i.delegateTarget&&n.call(t,i)}}var a=t("closest");e.exports=n},{closest:11}],15:[function(t,e,i){function n(t,e){if(a)return a.call(t,e);for(var i=t.parentNode.querySelectorAll(e),n=0;n<i.length;++n)if(i[n]==t)return!0;return!1}var r=Element.prototype,a=r.matchesSelector||r.webkitMatchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector;e.exports=n},{}],16:[function(t,e,i){function n(t,e){var i=window[window.GoogleAnalyticsObject||"ga"],r=t.get("name");window.gaplugins=window.gaplugins||{},gaplugins.Autotrack=n,i(r+".require","eventTracker",e),i(r+".require","mediaQueryTracker",e),i(r+".require","outboundFormTracker",e),i(r+".require","outboundLinkTracker",e),i(r+".require","sessionDurationTracker",e),i(r+".require","socialTracker",e),i(r+".require","urlChangeTracker",e)}t("./event-tracker"),t("./media-query-tracker"),t("./outbound-form-tracker"),t("./outbound-link-tracker"),t("./session-duration-tracker"),t("./social-tracker"),t("./url-change-tracker");var r=t("../provide");r("autotrack",n)},{"../provide":9,"./event-tracker":2,"./media-query-tracker":3,"./outbound-form-tracker":4,"./outbound-link-tracker":5,"./session-duration-tracker":6,"./social-tracker":7,"./url-change-tracker":8}]},{},[16]);
//# sourceMappingURL=autotrack.js.map


/*
 * Copyright 2016 Small Batch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/* Web Font Loader v1.6.26 - (c) Adobe Systems, Google. License: Apache 2.0 */(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function p(a,b,c){p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return p.apply(null,arguments)}var q=Date.now||function(){return+new Date};function ca(a,b){this.a=a;this.m=b||a;this.c=this.m.document}var da=!!window.FontFace;function t(a,b,c,d){b=a.c.createElement(b);if(c)for(var e in c)c.hasOwnProperty(e)&&("style"==e?b.style.cssText=c[e]:b.setAttribute(e,c[e]));d&&b.appendChild(a.c.createTextNode(d));return b}function u(a,b,c){a=a.c.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}function v(a){a.parentNode&&a.parentNode.removeChild(a)}
function w(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function y(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function z(a){if("string"===typeof a.f)return a.f;var b=a.m.location.protocol;"about:"==b&&(b=a.a.location.protocol);return"https:"==b?"https:":"http:"}function ea(a){return a.m.location.hostname||a.a.location.hostname}
function A(a,b,c){function d(){k&&e&&f&&(k(g),k=null)}b=t(a,"link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,k=c||null;da?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);u(a,"head",b)}
function B(a,b,c,d){var e=a.c.getElementsByTagName("head")[0];if(e){var f=t(a,"script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function C(){this.a=0;this.c=null}function D(a){a.a++;return function(){a.a--;E(a)}}function F(a,b){a.c=b;E(a)}function E(a){0==a.a&&a.c&&(a.c(),a.c=null)};function G(a){this.a=a||"-"}G.prototype.c=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.a)};function H(a,b){this.c=a;this.f=4;this.a="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.a=c[1],this.f=parseInt(c[2],10))}function fa(a){return I(a)+" "+(a.f+"00")+" 300px "+J(a.c)}function J(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function K(a){return a.a+a.f}function I(a){var b="normal";"o"===a.a?b="oblique":"i"===a.a&&(b="italic");return b}
function ga(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function ha(a,b){this.c=a;this.f=a.m.document.documentElement;this.h=b;this.a=new G("-");this.j=!1!==b.events;this.g=!1!==b.classes}function ia(a){a.g&&w(a.f,[a.a.c("wf","loading")]);L(a,"loading")}function M(a){if(a.g){var b=y(a.f,a.a.c("wf","active")),c=[],d=[a.a.c("wf","loading")];b||c.push(a.a.c("wf","inactive"));w(a.f,c,d)}L(a,"inactive")}function L(a,b,c){if(a.j&&a.h[b])if(c)a.h[b](c.c,K(c));else a.h[b]()};function ja(){this.c={}}function ka(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.c[e];f&&d.push(f(b[e],c))}return d};function N(a,b){this.c=a;this.f=b;this.a=t(this.c,"span",{"aria-hidden":"true"},this.f)}function O(a){u(a.c,"body",a.a)}function P(a){return"display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+J(a.c)+";"+("font-style:"+I(a)+";font-weight:"+(a.f+"00")+";")};function Q(a,b,c,d,e,f){this.g=a;this.j=b;this.a=d;this.c=c;this.f=e||3E3;this.h=f||void 0}Q.prototype.start=function(){var a=this.c.m.document,b=this,c=q(),d=new Promise(function(d,e){function k(){q()-c>=b.f?e():a.fonts.load(fa(b.a),b.h).then(function(a){1<=a.length?d():setTimeout(k,25)},function(){e()})}k()}),e=new Promise(function(a,d){setTimeout(d,b.f)});Promise.race([e,d]).then(function(){b.g(b.a)},function(){b.j(b.a)})};function R(a,b,c,d,e,f,g){this.v=a;this.B=b;this.c=c;this.a=d;this.s=g||"BESbswy";this.f={};this.w=e||3E3;this.u=f||null;this.o=this.j=this.h=this.g=null;this.g=new N(this.c,this.s);this.h=new N(this.c,this.s);this.j=new N(this.c,this.s);this.o=new N(this.c,this.s);a=new H(this.a.c+",serif",K(this.a));a=P(a);this.g.a.style.cssText=a;a=new H(this.a.c+",sans-serif",K(this.a));a=P(a);this.h.a.style.cssText=a;a=new H("serif",K(this.a));a=P(a);this.j.a.style.cssText=a;a=new H("sans-serif",K(this.a));a=
P(a);this.o.a.style.cssText=a;O(this.g);O(this.h);O(this.j);O(this.o)}var S={D:"serif",C:"sans-serif"},T=null;function U(){if(null===T){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);T=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return T}R.prototype.start=function(){this.f.serif=this.j.a.offsetWidth;this.f["sans-serif"]=this.o.a.offsetWidth;this.A=q();la(this)};
function ma(a,b,c){for(var d in S)if(S.hasOwnProperty(d)&&b===a.f[S[d]]&&c===a.f[S[d]])return!0;return!1}function la(a){var b=a.g.a.offsetWidth,c=a.h.a.offsetWidth,d;(d=b===a.f.serif&&c===a.f["sans-serif"])||(d=U()&&ma(a,b,c));d?q()-a.A>=a.w?U()&&ma(a,b,c)&&(null===a.u||a.u.hasOwnProperty(a.a.c))?V(a,a.v):V(a,a.B):na(a):V(a,a.v)}function na(a){setTimeout(p(function(){la(this)},a),50)}function V(a,b){setTimeout(p(function(){v(this.g.a);v(this.h.a);v(this.j.a);v(this.o.a);b(this.a)},a),0)};function W(a,b,c){this.c=a;this.a=b;this.f=0;this.o=this.j=!1;this.s=c}var X=null;W.prototype.g=function(a){var b=this.a;b.g&&w(b.f,[b.a.c("wf",a.c,K(a).toString(),"active")],[b.a.c("wf",a.c,K(a).toString(),"loading"),b.a.c("wf",a.c,K(a).toString(),"inactive")]);L(b,"fontactive",a);this.o=!0;oa(this)};
W.prototype.h=function(a){var b=this.a;if(b.g){var c=y(b.f,b.a.c("wf",a.c,K(a).toString(),"active")),d=[],e=[b.a.c("wf",a.c,K(a).toString(),"loading")];c||d.push(b.a.c("wf",a.c,K(a).toString(),"inactive"));w(b.f,d,e)}L(b,"fontinactive",a);oa(this)};function oa(a){0==--a.f&&a.j&&(a.o?(a=a.a,a.g&&w(a.f,[a.a.c("wf","active")],[a.a.c("wf","loading"),a.a.c("wf","inactive")]),L(a,"active")):M(a.a))};function pa(a){this.j=a;this.a=new ja;this.h=0;this.f=this.g=!0}pa.prototype.load=function(a){this.c=new ca(this.j,a.context||this.j);this.g=!1!==a.events;this.f=!1!==a.classes;qa(this,new ha(this.c,a),a)};
function ra(a,b,c,d,e){var f=0==--a.h;(a.f||a.g)&&setTimeout(function(){var a=e||null,k=d||null||{};if(0===c.length&&f)M(b.a);else{b.f+=c.length;f&&(b.j=f);var h,m=[];for(h=0;h<c.length;h++){var l=c[h],n=k[l.c],r=b.a,x=l;r.g&&w(r.f,[r.a.c("wf",x.c,K(x).toString(),"loading")]);L(r,"fontloading",x);r=null;null===X&&(X=window.FontFace?(x=/Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent))?42<parseInt(x[1],10):!0:!1);X?r=new Q(p(b.g,b),p(b.h,b),b.c,l,b.s,n):r=new R(p(b.g,b),p(b.h,b),b.c,l,b.s,a,
n);m.push(r)}for(h=0;h<m.length;h++)m[h].start()}},0)}function qa(a,b,c){var d=[],e=c.timeout;ia(b);var d=ka(a.a,c,a.c),f=new W(a.c,b,e);a.h=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,d,c){ra(a,f,b,d,c)})};function sa(a,b){this.c=a;this.a=b}function ta(a,b,c){var d=z(a.c);a=(a.a.api||"fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return d+"//"+a+"/"+b+".js"+(c?"?v="+c:"")}
sa.prototype.load=function(a){function b(){if(f["__mti_fntLst"+d]){var c=f["__mti_fntLst"+d](),e=[],h;if(c)for(var m=0;m<c.length;m++){var l=c[m].fontfamily;void 0!=c[m].fontStyle&&void 0!=c[m].fontWeight?(h=c[m].fontStyle+c[m].fontWeight,e.push(new H(l,h))):e.push(new H(l))}a(e)}else setTimeout(function(){b()},50)}var c=this,d=c.a.projectId,e=c.a.version;if(d){var f=c.c.m;B(this.c,ta(c,d,e),function(e){e?a([]):(f["__MonotypeConfiguration__"+d]=function(){return c.a},b())}).id="__MonotypeAPIScript__"+
d}else a([])};function ua(a,b){this.c=a;this.a=b}ua.prototype.load=function(a){var b,c,d=this.a.urls||[],e=this.a.families||[],f=this.a.testStrings||{},g=new C;b=0;for(c=d.length;b<c;b++)A(this.c,d[b],D(g));var k=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),m=0;m<h.length;m+=1)k.push(new H(d[0],h[m]));else k.push(new H(d[0]));F(g,function(){a(k,f)})};function va(a,b,c){a?this.c=a:this.c=b+wa;this.a=[];this.f=[];this.g=c||""}var wa="//fonts.googleapis.com/css";function xa(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.f.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.a.push(e.join(f))}}
function ya(a){if(0==a.a.length)throw Error("No fonts to load!");if(-1!=a.c.indexOf("kit="))return a.c;for(var b=a.a.length,c=[],d=0;d<b;d++)c.push(a.a[d].replace(/ /g,"+"));b=a.c+"?family="+c.join("%7C");0<a.f.length&&(b+="&subset="+a.f.join(","));0<a.g.length&&(b+="&text="+encodeURIComponent(a.g));return b};function za(a){this.f=a;this.a=[];this.c={}}
var Aa={latin:"BESbswy","latin-ext":"\u00e7\u00f6\u00fc\u011f\u015f",cyrillic:"\u0439\u044f\u0416",greek:"\u03b1\u03b2\u03a3",khmer:"\u1780\u1781\u1782",Hanuman:"\u1780\u1781\u1782"},Ba={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},Ca={i:"i",italic:"i",n:"n",normal:"n"},
Da=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
function Ea(a){for(var b=a.f.length,c=0;c<b;c++){var d=a.f[c].split(":"),e=d[0].replace(/\+/g," "),f=["n4"];if(2<=d.length){var g;var k=d[1];g=[];if(k)for(var k=k.split(","),h=k.length,m=0;m<h;m++){var l;l=k[m];if(l.match(/^[\w-]+$/)){var n=Da.exec(l.toLowerCase());if(null==n)l="";else{l=n[2];l=null==l||""==l?"n":Ca[l];n=n[1];if(null==n||""==n)n="4";else var r=Ba[n],n=r?r:isNaN(n)?"4":n.substr(0,1);l=[l,n].join("")}}else l="";l&&g.push(l)}0<g.length&&(f=g);3==d.length&&(d=d[2],g=[],d=d?d.split(","):
g,0<d.length&&(d=Aa[d[0]])&&(a.c[e]=d))}a.c[e]||(d=Aa[e])&&(a.c[e]=d);for(d=0;d<f.length;d+=1)a.a.push(new H(e,f[d]))}};function Fa(a,b){this.c=a;this.a=b}var Ga={Arimo:!0,Cousine:!0,Tinos:!0};Fa.prototype.load=function(a){var b=new C,c=this.c,d=new va(this.a.api,z(c),this.a.text),e=this.a.families;xa(d,e);var f=new za(e);Ea(f);A(c,ya(d),D(b));F(b,function(){a(f.a,f.c,Ga)})};function Ha(a,b){this.c=a;this.a=b}Ha.prototype.load=function(a){var b=this.a.id,c=this.c.m;b?B(this.c,(this.a.api||"https://www.dijitalreklam.org")+"/"+b+".js",function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],k=b[f+1],h=0;h<k.length;h++)e.push(new H(g,k[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(m){}a(e)}},2E3):a([])};function Ia(a,b){this.c=a;this.f=b;this.a=[]}Ia.prototype.load=function(a){var b=this.f.id,c=this.c.m,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,k=c.fonts.length;g<k;++g){var h=c.fonts[g];d.a.push(new H(h.name,ga("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.a)},B(this.c,z(this.c)+(this.f.api||"//f.fontdeck.com/s/css/js/")+ea(this.c)+"/"+b+".js",function(b){b&&a([])})):a([])};var Y=new pa(window);Y.a.c.custom=function(a,b){return new ua(b,a)};Y.a.c.fontdeck=function(a,b){return new Ia(b,a)};Y.a.c.monotype=function(a,b){return new sa(b,a)};Y.a.c.typekit=function(a,b){return new Ha(b,a)};Y.a.c.google=function(a,b){return new Fa(b,a)};var Z={load:p(Y.load,Y)};"function"===typeof define&&define.amd?define(function(){return Z}):"undefined"!==typeof module&&module.exports?module.exports=Z:(window.WebFont=Z,window.WebFontConfig&&Y.load(window.WebFontConfig));}());


/**
 * @popperjs/core v2.11.8 - MIT License
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Popper={})}(this,(function(e){"use strict";function t(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function n(e){return e instanceof t(e).Element||e instanceof Element}function r(e){return e instanceof t(e).HTMLElement||e instanceof HTMLElement}function o(e){return"undefined"!=typeof ShadowRoot&&(e instanceof t(e).ShadowRoot||e instanceof ShadowRoot)}var i=Math.max,a=Math.min,s=Math.round;function f(){var e=navigator.userAgentData;return null!=e&&e.brands&&Array.isArray(e.brands)?e.brands.map((function(e){return e.brand+"/"+e.version})).join(" "):navigator.userAgent}function c(){return!/^((?!chrome|android).)*safari/i.test(f())}function p(e,o,i){void 0===o&&(o=!1),void 0===i&&(i=!1);var a=e.getBoundingClientRect(),f=1,p=1;o&&r(e)&&(f=e.offsetWidth>0&&s(a.width)/e.offsetWidth||1,p=e.offsetHeight>0&&s(a.height)/e.offsetHeight||1);var u=(n(e)?t(e):window).visualViewport,l=!c()&&i,d=(a.left+(l&&u?u.offsetLeft:0))/f,h=(a.top+(l&&u?u.offsetTop:0))/p,m=a.width/f,v=a.height/p;return{width:m,height:v,top:h,right:d+m,bottom:h+v,left:d,x:d,y:h}}function u(e){var n=t(e);return{scrollLeft:n.pageXOffset,scrollTop:n.pageYOffset}}function l(e){return e?(e.nodeName||"").toLowerCase():null}function d(e){return((n(e)?e.ownerDocument:e.document)||window.document).documentElement}function h(e){return p(d(e)).left+u(e).scrollLeft}function m(e){return t(e).getComputedStyle(e)}function v(e){var t=m(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function y(e,n,o){void 0===o&&(o=!1);var i,a,f=r(n),c=r(n)&&function(e){var t=e.getBoundingClientRect(),n=s(t.width)/e.offsetWidth||1,r=s(t.height)/e.offsetHeight||1;return 1!==n||1!==r}(n),m=d(n),y=p(e,c,o),g={scrollLeft:0,scrollTop:0},b={x:0,y:0};return(f||!f&&!o)&&(("body"!==l(n)||v(m))&&(g=(i=n)!==t(i)&&r(i)?{scrollLeft:(a=i).scrollLeft,scrollTop:a.scrollTop}:u(i)),r(n)?((b=p(n,!0)).x+=n.clientLeft,b.y+=n.clientTop):m&&(b.x=h(m))),{x:y.left+g.scrollLeft-b.x,y:y.top+g.scrollTop-b.y,width:y.width,height:y.height}}function g(e){var t=p(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function b(e){return"html"===l(e)?e:e.assignedSlot||e.parentNode||(o(e)?e.host:null)||d(e)}function x(e){return["html","body","#document"].indexOf(l(e))>=0?e.ownerDocument.body:r(e)&&v(e)?e:x(b(e))}function w(e,n){var r;void 0===n&&(n=[]);var o=x(e),i=o===(null==(r=e.ownerDocument)?void 0:r.body),a=t(o),s=i?[a].concat(a.visualViewport||[],v(o)?o:[]):o,f=n.concat(s);return i?f:f.concat(w(b(s)))}function O(e){return["table","td","th"].indexOf(l(e))>=0}function j(e){return r(e)&&"fixed"!==m(e).position?e.offsetParent:null}function E(e){for(var n=t(e),i=j(e);i&&O(i)&&"static"===m(i).position;)i=j(i);return i&&("html"===l(i)||"body"===l(i)&&"static"===m(i).position)?n:i||function(e){var t=/firefox/i.test(f());if(/Trident/i.test(f())&&r(e)&&"fixed"===m(e).position)return null;var n=b(e);for(o(n)&&(n=n.host);r(n)&&["html","body"].indexOf(l(n))<0;){var i=m(n);if("none"!==i.transform||"none"!==i.perspective||"paint"===i.contain||-1!==["transform","perspective"].indexOf(i.willChange)||t&&"filter"===i.willChange||t&&i.filter&&"none"!==i.filter)return n;n=n.parentNode}return null}(e)||n}var D="top",A="bottom",L="right",P="left",M="auto",k=[D,A,L,P],W="start",B="end",H="viewport",T="popper",R=k.reduce((function(e,t){return e.concat([t+"-"+W,t+"-"+B])}),[]),S=[].concat(k,[M]).reduce((function(e,t){return e.concat([t,t+"-"+W,t+"-"+B])}),[]),V=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function q(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}function C(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&o(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function N(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function I(e,r,o){return r===H?N(function(e,n){var r=t(e),o=d(e),i=r.visualViewport,a=o.clientWidth,s=o.clientHeight,f=0,p=0;if(i){a=i.width,s=i.height;var u=c();(u||!u&&"fixed"===n)&&(f=i.offsetLeft,p=i.offsetTop)}return{width:a,height:s,x:f+h(e),y:p}}(e,o)):n(r)?function(e,t){var n=p(e,!1,"fixed"===t);return n.top=n.top+e.clientTop,n.left=n.left+e.clientLeft,n.bottom=n.top+e.clientHeight,n.right=n.left+e.clientWidth,n.width=e.clientWidth,n.height=e.clientHeight,n.x=n.left,n.y=n.top,n}(r,o):N(function(e){var t,n=d(e),r=u(e),o=null==(t=e.ownerDocument)?void 0:t.body,a=i(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),s=i(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),f=-r.scrollLeft+h(e),c=-r.scrollTop;return"rtl"===m(o||n).direction&&(f+=i(n.clientWidth,o?o.clientWidth:0)-a),{width:a,height:s,x:f,y:c}}(d(e)))}function _(e,t,o,s){var f="clippingParents"===t?function(e){var t=w(b(e)),o=["absolute","fixed"].indexOf(m(e).position)>=0&&r(e)?E(e):e;return n(o)?t.filter((function(e){return n(e)&&C(e,o)&&"body"!==l(e)})):[]}(e):[].concat(t),c=[].concat(f,[o]),p=c[0],u=c.reduce((function(t,n){var r=I(e,n,s);return t.top=i(r.top,t.top),t.right=a(r.right,t.right),t.bottom=a(r.bottom,t.bottom),t.left=i(r.left,t.left),t}),I(e,p,s));return u.width=u.right-u.left,u.height=u.bottom-u.top,u.x=u.left,u.y=u.top,u}function F(e){return e.split("-")[0]}function U(e){return e.split("-")[1]}function z(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function X(e){var t,n=e.reference,r=e.element,o=e.placement,i=o?F(o):null,a=o?U(o):null,s=n.x+n.width/2-r.width/2,f=n.y+n.height/2-r.height/2;switch(i){case D:t={x:s,y:n.y-r.height};break;case A:t={x:s,y:n.y+n.height};break;case L:t={x:n.x+n.width,y:f};break;case P:t={x:n.x-r.width,y:f};break;default:t={x:n.x,y:n.y}}var c=i?z(i):null;if(null!=c){var p="y"===c?"height":"width";switch(a){case W:t[c]=t[c]-(n[p]/2-r[p]/2);break;case B:t[c]=t[c]+(n[p]/2-r[p]/2)}}return t}function Y(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}function G(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}function J(e,t){void 0===t&&(t={});var r=t,o=r.placement,i=void 0===o?e.placement:o,a=r.strategy,s=void 0===a?e.strategy:a,f=r.boundary,c=void 0===f?"clippingParents":f,u=r.rootBoundary,l=void 0===u?H:u,h=r.elementContext,m=void 0===h?T:h,v=r.altBoundary,y=void 0!==v&&v,g=r.padding,b=void 0===g?0:g,x=Y("number"!=typeof b?b:G(b,k)),w=m===T?"reference":T,O=e.rects.popper,j=e.elements[y?w:m],E=_(n(j)?j:j.contextElement||d(e.elements.popper),c,l,s),P=p(e.elements.reference),M=X({reference:P,element:O,strategy:"absolute",placement:i}),W=N(Object.assign({},O,M)),B=m===T?W:P,R={top:E.top-B.top+x.top,bottom:B.bottom-E.bottom+x.bottom,left:E.left-B.left+x.left,right:B.right-E.right+x.right},S=e.modifiersData.offset;if(m===T&&S){var V=S[i];Object.keys(R).forEach((function(e){var t=[L,A].indexOf(e)>=0?1:-1,n=[D,A].indexOf(e)>=0?"y":"x";R[e]+=V[n]*t}))}return R}var K={placement:"bottom",modifiers:[],strategy:"absolute"};function Q(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"==typeof e.getBoundingClientRect)}))}function Z(e){void 0===e&&(e={});var t=e,r=t.defaultModifiers,o=void 0===r?[]:r,i=t.defaultOptions,a=void 0===i?K:i;return function(e,t,r){void 0===r&&(r=a);var i,s,f={placement:"bottom",orderedModifiers:[],options:Object.assign({},K,a),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},c=[],p=!1,u={state:f,setOptions:function(r){var i="function"==typeof r?r(f.options):r;l(),f.options=Object.assign({},a,f.options,i),f.scrollParents={reference:n(e)?w(e):e.contextElement?w(e.contextElement):[],popper:w(t)};var s,p,d=function(e){var t=q(e);return V.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}((s=[].concat(o,f.options.modifiers),p=s.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{}),Object.keys(p).map((function(e){return p[e]}))));return f.orderedModifiers=d.filter((function(e){return e.enabled})),f.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,o=e.effect;if("function"==typeof o){var i=o({state:f,name:t,instance:u,options:r}),a=function(){};c.push(i||a)}})),u.update()},forceUpdate:function(){if(!p){var e=f.elements,t=e.reference,n=e.popper;if(Q(t,n)){f.rects={reference:y(t,E(n),"fixed"===f.options.strategy),popper:g(n)},f.reset=!1,f.placement=f.options.placement,f.orderedModifiers.forEach((function(e){return f.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<f.orderedModifiers.length;r++)if(!0!==f.reset){var o=f.orderedModifiers[r],i=o.fn,a=o.options,s=void 0===a?{}:a,c=o.name;"function"==typeof i&&(f=i({state:f,options:s,name:c,instance:u})||f)}else f.reset=!1,r=-1}}},update:(i=function(){return new Promise((function(e){u.forceUpdate(),e(f)}))},function(){return s||(s=new Promise((function(e){Promise.resolve().then((function(){s=void 0,e(i())}))}))),s}),destroy:function(){l(),p=!0}};if(!Q(e,t))return u;function l(){c.forEach((function(e){return e()})),c=[]}return u.setOptions(r).then((function(e){!p&&r.onFirstUpdate&&r.onFirstUpdate(e)})),u}}var $={passive:!0};var ee={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var n=e.state,r=e.instance,o=e.options,i=o.scroll,a=void 0===i||i,s=o.resize,f=void 0===s||s,c=t(n.elements.popper),p=[].concat(n.scrollParents.reference,n.scrollParents.popper);return a&&p.forEach((function(e){e.addEventListener("scroll",r.update,$)})),f&&c.addEventListener("resize",r.update,$),function(){a&&p.forEach((function(e){e.removeEventListener("scroll",r.update,$)})),f&&c.removeEventListener("resize",r.update,$)}},data:{}};var te={name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=X({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},ne={top:"auto",right:"auto",bottom:"auto",left:"auto"};function re(e){var n,r=e.popper,o=e.popperRect,i=e.placement,a=e.variation,f=e.offsets,c=e.position,p=e.gpuAcceleration,u=e.adaptive,l=e.roundOffsets,h=e.isFixed,v=f.x,y=void 0===v?0:v,g=f.y,b=void 0===g?0:g,x="function"==typeof l?l({x:y,y:b}):{x:y,y:b};y=x.x,b=x.y;var w=f.hasOwnProperty("x"),O=f.hasOwnProperty("y"),j=P,M=D,k=window;if(u){var W=E(r),H="clientHeight",T="clientWidth";if(W===t(r)&&"static"!==m(W=d(r)).position&&"absolute"===c&&(H="scrollHeight",T="scrollWidth"),W=W,i===D||(i===P||i===L)&&a===B)M=A,b-=(h&&W===k&&k.visualViewport?k.visualViewport.height:W[H])-o.height,b*=p?1:-1;if(i===P||(i===D||i===A)&&a===B)j=L,y-=(h&&W===k&&k.visualViewport?k.visualViewport.width:W[T])-o.width,y*=p?1:-1}var R,S=Object.assign({position:c},u&&ne),V=!0===l?function(e,t){var n=e.x,r=e.y,o=t.devicePixelRatio||1;return{x:s(n*o)/o||0,y:s(r*o)/o||0}}({x:y,y:b},t(r)):{x:y,y:b};return y=V.x,b=V.y,p?Object.assign({},S,((R={})[M]=O?"0":"",R[j]=w?"0":"",R.transform=(k.devicePixelRatio||1)<=1?"translate("+y+"px, "+b+"px)":"translate3d("+y+"px, "+b+"px, 0)",R)):Object.assign({},S,((n={})[M]=O?b+"px":"",n[j]=w?y+"px":"",n.transform="",n))}var oe={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,f=void 0===s||s,c={placement:F(t.placement),variation:U(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,re(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:f})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,re(Object.assign({},c,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:f})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}};var ie={name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var n=t.styles[e]||{},o=t.attributes[e]||{},i=t.elements[e];r(i)&&l(i)&&(Object.assign(i.style,n),Object.keys(o).forEach((function(e){var t=o[e];!1===t?i.removeAttribute(e):i.setAttribute(e,!0===t?"":t)})))}))},effect:function(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach((function(e){var o=t.elements[e],i=t.attributes[e]||{},a=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:n[e]).reduce((function(e,t){return e[t]="",e}),{});r(o)&&l(o)&&(Object.assign(o.style,a),Object.keys(i).forEach((function(e){o.removeAttribute(e)})))}))}},requires:["computeStyles"]};var ae={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=void 0===o?[0,0]:o,a=S.reduce((function(e,n){return e[n]=function(e,t,n){var r=F(e),o=[P,D].indexOf(r)>=0?-1:1,i="function"==typeof n?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[P,L].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}(n,t.rects,i),e}),{}),s=a[t.placement],f=s.x,c=s.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=f,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=a}},se={left:"right",right:"left",bottom:"top",top:"bottom"};function fe(e){return e.replace(/left|right|bottom|top/g,(function(e){return se[e]}))}var ce={start:"end",end:"start"};function pe(e){return e.replace(/start|end/g,(function(e){return ce[e]}))}function ue(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,f=n.allowedAutoPlacements,c=void 0===f?S:f,p=U(r),u=p?s?R:R.filter((function(e){return U(e)===p})):k,l=u.filter((function(e){return c.indexOf(e)>=0}));0===l.length&&(l=u);var d=l.reduce((function(t,n){return t[n]=J(e,{placement:n,boundary:o,rootBoundary:i,padding:a})[F(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}var le={name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0===a||a,f=n.fallbackPlacements,c=n.padding,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.flipVariations,h=void 0===d||d,m=n.allowedAutoPlacements,v=t.options.placement,y=F(v),g=f||(y===v||!h?[fe(v)]:function(e){if(F(e)===M)return[];var t=fe(e);return[pe(e),t,pe(t)]}(v)),b=[v].concat(g).reduce((function(e,n){return e.concat(F(n)===M?ue(t,{placement:n,boundary:p,rootBoundary:u,padding:c,flipVariations:h,allowedAutoPlacements:m}):n)}),[]),x=t.rects.reference,w=t.rects.popper,O=new Map,j=!0,E=b[0],k=0;k<b.length;k++){var B=b[k],H=F(B),T=U(B)===W,R=[D,A].indexOf(H)>=0,S=R?"width":"height",V=J(t,{placement:B,boundary:p,rootBoundary:u,altBoundary:l,padding:c}),q=R?T?L:P:T?A:D;x[S]>w[S]&&(q=fe(q));var C=fe(q),N=[];if(i&&N.push(V[H]<=0),s&&N.push(V[q]<=0,V[C]<=0),N.every((function(e){return e}))){E=B,j=!1;break}O.set(B,N)}if(j)for(var I=function(e){var t=b.find((function(t){var n=O.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return E=t,"break"},_=h?3:1;_>0;_--){if("break"===I(_))break}t.placement!==E&&(t.modifiersData[r]._skip=!0,t.placement=E,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}};function de(e,t,n){return i(e,a(t,n))}var he={name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,s=void 0===o||o,f=n.altAxis,c=void 0!==f&&f,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.padding,h=n.tether,m=void 0===h||h,v=n.tetherOffset,y=void 0===v?0:v,b=J(t,{boundary:p,rootBoundary:u,padding:d,altBoundary:l}),x=F(t.placement),w=U(t.placement),O=!w,j=z(x),M="x"===j?"y":"x",k=t.modifiersData.popperOffsets,B=t.rects.reference,H=t.rects.popper,T="function"==typeof y?y(Object.assign({},t.rects,{placement:t.placement})):y,R="number"==typeof T?{mainAxis:T,altAxis:T}:Object.assign({mainAxis:0,altAxis:0},T),S=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,V={x:0,y:0};if(k){if(s){var q,C="y"===j?D:P,N="y"===j?A:L,I="y"===j?"height":"width",_=k[j],X=_+b[C],Y=_-b[N],G=m?-H[I]/2:0,K=w===W?B[I]:H[I],Q=w===W?-H[I]:-B[I],Z=t.elements.arrow,$=m&&Z?g(Z):{width:0,height:0},ee=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},te=ee[C],ne=ee[N],re=de(0,B[I],$[I]),oe=O?B[I]/2-G-re-te-R.mainAxis:K-re-te-R.mainAxis,ie=O?-B[I]/2+G+re+ne+R.mainAxis:Q+re+ne+R.mainAxis,ae=t.elements.arrow&&E(t.elements.arrow),se=ae?"y"===j?ae.clientTop||0:ae.clientLeft||0:0,fe=null!=(q=null==S?void 0:S[j])?q:0,ce=_+ie-fe,pe=de(m?a(X,_+oe-fe-se):X,_,m?i(Y,ce):Y);k[j]=pe,V[j]=pe-_}if(c){var ue,le="x"===j?D:P,he="x"===j?A:L,me=k[M],ve="y"===M?"height":"width",ye=me+b[le],ge=me-b[he],be=-1!==[D,P].indexOf(x),xe=null!=(ue=null==S?void 0:S[M])?ue:0,we=be?ye:me-B[ve]-H[ve]-xe+R.altAxis,Oe=be?me+B[ve]+H[ve]-xe-R.altAxis:ge,je=m&&be?function(e,t,n){var r=de(e,t,n);return r>n?n:r}(we,me,Oe):de(m?we:ye,me,m?Oe:ge);k[M]=je,V[M]=je-me}t.modifiersData[r]=V}},requiresIfExists:["offset"]};var me={name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=F(n.placement),f=z(s),c=[P,L].indexOf(s)>=0?"height":"width";if(i&&a){var p=function(e,t){return Y("number"!=typeof(e="function"==typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e)?e:G(e,k))}(o.padding,n),u=g(i),l="y"===f?D:P,d="y"===f?A:L,h=n.rects.reference[c]+n.rects.reference[f]-a[f]-n.rects.popper[c],m=a[f]-n.rects.reference[f],v=E(i),y=v?"y"===f?v.clientHeight||0:v.clientWidth||0:0,b=h/2-m/2,x=p[l],w=y-u[c]-p[d],O=y/2-u[c]/2+b,j=de(x,O,w),M=f;n.modifiersData[r]=((t={})[M]=j,t.centerOffset=j-O,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!=typeof r||(r=t.elements.popper.querySelector(r)))&&C(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function ve(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function ye(e){return[D,L,A,P].some((function(t){return e[t]>=0}))}var ge={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=J(t,{elementContext:"reference"}),s=J(t,{altBoundary:!0}),f=ve(a,r),c=ve(s,o,i),p=ye(f),u=ye(c);t.modifiersData[n]={referenceClippingOffsets:f,popperEscapeOffsets:c,isReferenceHidden:p,hasPopperEscaped:u},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":p,"data-popper-escaped":u})}},be=Z({defaultModifiers:[ee,te,oe,ie]}),xe=[ee,te,oe,ie,ae,le,he,me,ge],we=Z({defaultModifiers:xe});e.applyStyles=ie,e.arrow=me,e.computeStyles=oe,e.createPopper=we,e.createPopperLite=be,e.defaultModifiers=xe,e.detectOverflow=J,e.eventListeners=ee,e.flip=le,e.hide=ge,e.offset=ae,e.popperGenerator=Z,e.popperOffsets=te,e.preventOverflow=he,Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=popper.min.js.map

/* Tippy */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("@popperjs/core")):"function"==typeof define&&define.amd?define(["@popperjs/core"],e):(t=t||self).tippy=e(t.Popper)}(this,(function(t){"use strict";var e="undefined"!=typeof window&&"undefined"!=typeof document,n=!!e&&!!window.msCrypto,r={passive:!0,capture:!0},o=function(){return document.body};function i(t,e,n){if(Array.isArray(t)){var r=t[e];return null==r?Array.isArray(n)?n[e]:n:r}return t}function a(t,e){var n={}.toString.call(t);return 0===n.indexOf("[object")&&n.indexOf(e+"]")>-1}function s(t,e){return"function"==typeof t?t.apply(void 0,e):t}function u(t,e){return 0===e?t:function(r){clearTimeout(n),n=setTimeout((function(){t(r)}),e)};var n}function p(t,e){var n=Object.assign({},t);return e.forEach((function(t){delete n[t]})),n}function c(t){return[].concat(t)}function f(t,e){-1===t.indexOf(e)&&t.push(e)}function l(t){return t.split("-")[0]}function d(t){return[].slice.call(t)}function v(t){return Object.keys(t).reduce((function(e,n){return void 0!==t[n]&&(e[n]=t[n]),e}),{})}function m(){return document.createElement("div")}function g(t){return["Element","Fragment"].some((function(e){return a(t,e)}))}function h(t){return a(t,"MouseEvent")}function b(t){return!(!t||!t._tippy||t._tippy.reference!==t)}function y(t){return g(t)?[t]:function(t){return a(t,"NodeList")}(t)?d(t):Array.isArray(t)?t:d(document.querySelectorAll(t))}function w(t,e){t.forEach((function(t){t&&(t.style.transitionDuration=e+"ms")}))}function x(t,e){t.forEach((function(t){t&&t.setAttribute("data-state",e)}))}function E(t){var e,n=c(t)[0];return null!=n&&null!=(e=n.ownerDocument)&&e.body?n.ownerDocument:document}function O(t,e,n){var r=e+"EventListener";["transitionend","webkitTransitionEnd"].forEach((function(e){t[r](e,n)}))}function C(t,e){for(var n=e;n;){var r;if(t.contains(n))return!0;n=null==n.getRootNode||null==(r=n.getRootNode())?void 0:r.host}return!1}var T={isTouch:!1},A=0;function L(){T.isTouch||(T.isTouch=!0,window.performance&&document.addEventListener("mousemove",D))}function D(){var t=performance.now();t-A<20&&(T.isTouch=!1,document.removeEventListener("mousemove",D)),A=t}function k(){var t=document.activeElement;if(b(t)){var e=t._tippy;t.blur&&!e.state.isVisible&&t.blur()}}var R=Object.assign({appendTo:o,aria:{content:"auto",expanded:"auto"},delay:0,duration:[300,250],getReferenceClientRect:null,hideOnClick:!0,ignoreAttributes:!1,interactive:!1,interactiveBorder:2,interactiveDebounce:0,moveTransition:"",offset:[0,10],onAfterUpdate:function(){},onBeforeUpdate:function(){},onCreate:function(){},onDestroy:function(){},onHidden:function(){},onHide:function(){},onMount:function(){},onShow:function(){},onShown:function(){},onTrigger:function(){},onUntrigger:function(){},onClickOutside:function(){},placement:"top",plugins:[],popperOptions:{},render:null,showOnCreate:!1,touch:!0,trigger:"mouseenter focus",triggerTarget:null},{animateFill:!1,followCursor:!1,inlinePositioning:!1,sticky:!1},{allowHTML:!1,animation:"fade",arrow:!0,content:"",inertia:!1,maxWidth:350,role:"tooltip",theme:"",zIndex:9999}),P=Object.keys(R);function j(t){var e=(t.plugins||[]).reduce((function(e,n){var r,o=n.name,i=n.defaultValue;o&&(e[o]=void 0!==t[o]?t[o]:null!=(r=R[o])?r:i);return e}),{});return Object.assign({},t,e)}function M(t,e){var n=Object.assign({},e,{content:s(e.content,[t])},e.ignoreAttributes?{}:function(t,e){return(e?Object.keys(j(Object.assign({},R,{plugins:e}))):P).reduce((function(e,n){var r=(t.getAttribute("data-tippy-"+n)||"").trim();if(!r)return e;if("content"===n)e[n]=r;else try{e[n]=JSON.parse(r)}catch(t){e[n]=r}return e}),{})}(t,e.plugins));return n.aria=Object.assign({},R.aria,n.aria),n.aria={expanded:"auto"===n.aria.expanded?e.interactive:n.aria.expanded,content:"auto"===n.aria.content?e.interactive?null:"describedby":n.aria.content},n}function V(t,e){t.innerHTML=e}function I(t){var e=m();return!0===t?e.className="tippy-arrow":(e.className="tippy-svg-arrow",g(t)?e.appendChild(t):V(e,t)),e}function S(t,e){g(e.content)?(V(t,""),t.appendChild(e.content)):"function"!=typeof e.content&&(e.allowHTML?V(t,e.content):t.textContent=e.content)}function B(t){var e=t.firstElementChild,n=d(e.children);return{box:e,content:n.find((function(t){return t.classList.contains("tippy-content")})),arrow:n.find((function(t){return t.classList.contains("tippy-arrow")||t.classList.contains("tippy-svg-arrow")})),backdrop:n.find((function(t){return t.classList.contains("tippy-backdrop")}))}}function N(t){var e=m(),n=m();n.className="tippy-box",n.setAttribute("data-state","hidden"),n.setAttribute("tabindex","-1");var r=m();function o(n,r){var o=B(e),i=o.box,a=o.content,s=o.arrow;r.theme?i.setAttribute("data-theme",r.theme):i.removeAttribute("data-theme"),"string"==typeof r.animation?i.setAttribute("data-animation",r.animation):i.removeAttribute("data-animation"),r.inertia?i.setAttribute("data-inertia",""):i.removeAttribute("data-inertia"),i.style.maxWidth="number"==typeof r.maxWidth?r.maxWidth+"px":r.maxWidth,r.role?i.setAttribute("role",r.role):i.removeAttribute("role"),n.content===r.content&&n.allowHTML===r.allowHTML||S(a,t.props),r.arrow?s?n.arrow!==r.arrow&&(i.removeChild(s),i.appendChild(I(r.arrow))):i.appendChild(I(r.arrow)):s&&i.removeChild(s)}return r.className="tippy-content",r.setAttribute("data-state","hidden"),S(r,t.props),e.appendChild(n),n.appendChild(r),o(t.props,t.props),{popper:e,onUpdate:o}}N.$$tippy=!0;var H=1,U=[],_=[];function z(e,a){var p,g,b,y,A,L,D,k,P=M(e,Object.assign({},R,j(v(a)))),V=!1,I=!1,S=!1,N=!1,z=[],F=u(wt,P.interactiveDebounce),W=H++,X=(k=P.plugins).filter((function(t,e){return k.indexOf(t)===e})),Y={id:W,reference:e,popper:m(),popperInstance:null,props:P,state:{isEnabled:!0,isVisible:!1,isDestroyed:!1,isMounted:!1,isShown:!1},plugins:X,clearDelayTimeouts:function(){clearTimeout(p),clearTimeout(g),cancelAnimationFrame(b)},setProps:function(t){if(Y.state.isDestroyed)return;at("onBeforeUpdate",[Y,t]),bt();var n=Y.props,r=M(e,Object.assign({},n,v(t),{ignoreAttributes:!0}));Y.props=r,ht(),n.interactiveDebounce!==r.interactiveDebounce&&(pt(),F=u(wt,r.interactiveDebounce));n.triggerTarget&&!r.triggerTarget?c(n.triggerTarget).forEach((function(t){t.removeAttribute("aria-expanded")})):r.triggerTarget&&e.removeAttribute("aria-expanded");ut(),it(),J&&J(n,r);Y.popperInstance&&(Ct(),At().forEach((function(t){requestAnimationFrame(t._tippy.popperInstance.forceUpdate)})));at("onAfterUpdate",[Y,t])},setContent:function(t){Y.setProps({content:t})},show:function(){var t=Y.state.isVisible,e=Y.state.isDestroyed,n=!Y.state.isEnabled,r=T.isTouch&&!Y.props.touch,a=i(Y.props.duration,0,R.duration);if(t||e||n||r)return;if(et().hasAttribute("disabled"))return;if(at("onShow",[Y],!1),!1===Y.props.onShow(Y))return;Y.state.isVisible=!0,tt()&&($.style.visibility="visible");it(),dt(),Y.state.isMounted||($.style.transition="none");if(tt()){var u=rt(),p=u.box,c=u.content;w([p,c],0)}L=function(){var t;if(Y.state.isVisible&&!N){if(N=!0,$.offsetHeight,$.style.transition=Y.props.moveTransition,tt()&&Y.props.animation){var e=rt(),n=e.box,r=e.content;w([n,r],a),x([n,r],"visible")}st(),ut(),f(_,Y),null==(t=Y.popperInstance)||t.forceUpdate(),at("onMount",[Y]),Y.props.animation&&tt()&&function(t,e){mt(t,e)}(a,(function(){Y.state.isShown=!0,at("onShown",[Y])}))}},function(){var t,e=Y.props.appendTo,n=et();t=Y.props.interactive&&e===o||"parent"===e?n.parentNode:s(e,[n]);t.contains($)||t.appendChild($);Y.state.isMounted=!0,Ct()}()},hide:function(){var t=!Y.state.isVisible,e=Y.state.isDestroyed,n=!Y.state.isEnabled,r=i(Y.props.duration,1,R.duration);if(t||e||n)return;if(at("onHide",[Y],!1),!1===Y.props.onHide(Y))return;Y.state.isVisible=!1,Y.state.isShown=!1,N=!1,V=!1,tt()&&($.style.visibility="hidden");if(pt(),vt(),it(!0),tt()){var o=rt(),a=o.box,s=o.content;Y.props.animation&&(w([a,s],r),x([a,s],"hidden"))}st(),ut(),Y.props.animation?tt()&&function(t,e){mt(t,(function(){!Y.state.isVisible&&$.parentNode&&$.parentNode.contains($)&&e()}))}(r,Y.unmount):Y.unmount()},hideWithInteractivity:function(t){nt().addEventListener("mousemove",F),f(U,F),F(t)},enable:function(){Y.state.isEnabled=!0},disable:function(){Y.hide(),Y.state.isEnabled=!1},unmount:function(){Y.state.isVisible&&Y.hide();if(!Y.state.isMounted)return;Tt(),At().forEach((function(t){t._tippy.unmount()})),$.parentNode&&$.parentNode.removeChild($);_=_.filter((function(t){return t!==Y})),Y.state.isMounted=!1,at("onHidden",[Y])},destroy:function(){if(Y.state.isDestroyed)return;Y.clearDelayTimeouts(),Y.unmount(),bt(),delete e._tippy,Y.state.isDestroyed=!0,at("onDestroy",[Y])}};if(!P.render)return Y;var q=P.render(Y),$=q.popper,J=q.onUpdate;$.setAttribute("data-tippy-root",""),$.id="tippy-"+Y.id,Y.popper=$,e._tippy=Y,$._tippy=Y;var G=X.map((function(t){return t.fn(Y)})),K=e.hasAttribute("aria-expanded");return ht(),ut(),it(),at("onCreate",[Y]),P.showOnCreate&&Lt(),$.addEventListener("mouseenter",(function(){Y.props.interactive&&Y.state.isVisible&&Y.clearDelayTimeouts()})),$.addEventListener("mouseleave",(function(){Y.props.interactive&&Y.props.trigger.indexOf("mouseenter")>=0&&nt().addEventListener("mousemove",F)})),Y;function Q(){var t=Y.props.touch;return Array.isArray(t)?t:[t,0]}function Z(){return"hold"===Q()[0]}function tt(){var t;return!(null==(t=Y.props.render)||!t.$$tippy)}function et(){return D||e}function nt(){var t=et().parentNode;return t?E(t):document}function rt(){return B($)}function ot(t){return Y.state.isMounted&&!Y.state.isVisible||T.isTouch||y&&"focus"===y.type?0:i(Y.props.delay,t?0:1,R.delay)}function it(t){void 0===t&&(t=!1),$.style.pointerEvents=Y.props.interactive&&!t?"":"none",$.style.zIndex=""+Y.props.zIndex}function at(t,e,n){var r;(void 0===n&&(n=!0),G.forEach((function(n){n[t]&&n[t].apply(n,e)})),n)&&(r=Y.props)[t].apply(r,e)}function st(){var t=Y.props.aria;if(t.content){var n="aria-"+t.content,r=$.id;c(Y.props.triggerTarget||e).forEach((function(t){var e=t.getAttribute(n);if(Y.state.isVisible)t.setAttribute(n,e?e+" "+r:r);else{var o=e&&e.replace(r,"").trim();o?t.setAttribute(n,o):t.removeAttribute(n)}}))}}function ut(){!K&&Y.props.aria.expanded&&c(Y.props.triggerTarget||e).forEach((function(t){Y.props.interactive?t.setAttribute("aria-expanded",Y.state.isVisible&&t===et()?"true":"false"):t.removeAttribute("aria-expanded")}))}function pt(){nt().removeEventListener("mousemove",F),U=U.filter((function(t){return t!==F}))}function ct(t){if(!T.isTouch||!S&&"mousedown"!==t.type){var n=t.composedPath&&t.composedPath()[0]||t.target;if(!Y.props.interactive||!C($,n)){if(c(Y.props.triggerTarget||e).some((function(t){return C(t,n)}))){if(T.isTouch)return;if(Y.state.isVisible&&Y.props.trigger.indexOf("click")>=0)return}else at("onClickOutside",[Y,t]);!0===Y.props.hideOnClick&&(Y.clearDelayTimeouts(),Y.hide(),I=!0,setTimeout((function(){I=!1})),Y.state.isMounted||vt())}}}function ft(){S=!0}function lt(){S=!1}function dt(){var t=nt();t.addEventListener("mousedown",ct,!0),t.addEventListener("touchend",ct,r),t.addEventListener("touchstart",lt,r),t.addEventListener("touchmove",ft,r)}function vt(){var t=nt();t.removeEventListener("mousedown",ct,!0),t.removeEventListener("touchend",ct,r),t.removeEventListener("touchstart",lt,r),t.removeEventListener("touchmove",ft,r)}function mt(t,e){var n=rt().box;function r(t){t.target===n&&(O(n,"remove",r),e())}if(0===t)return e();O(n,"remove",A),O(n,"add",r),A=r}function gt(t,n,r){void 0===r&&(r=!1),c(Y.props.triggerTarget||e).forEach((function(e){e.addEventListener(t,n,r),z.push({node:e,eventType:t,handler:n,options:r})}))}function ht(){var t;Z()&&(gt("touchstart",yt,{passive:!0}),gt("touchend",xt,{passive:!0})),(t=Y.props.trigger,t.split(/\s+/).filter(Boolean)).forEach((function(t){if("manual"!==t)switch(gt(t,yt),t){case"mouseenter":gt("mouseleave",xt);break;case"focus":gt(n?"focusout":"blur",Et);break;case"focusin":gt("focusout",Et)}}))}function bt(){z.forEach((function(t){var e=t.node,n=t.eventType,r=t.handler,o=t.options;e.removeEventListener(n,r,o)})),z=[]}function yt(t){var e,n=!1;if(Y.state.isEnabled&&!Ot(t)&&!I){var r="focus"===(null==(e=y)?void 0:e.type);y=t,D=t.currentTarget,ut(),!Y.state.isVisible&&h(t)&&U.forEach((function(e){return e(t)})),"click"===t.type&&(Y.props.trigger.indexOf("mouseenter")<0||V)&&!1!==Y.props.hideOnClick&&Y.state.isVisible?n=!0:Lt(t),"click"===t.type&&(V=!n),n&&!r&&Dt(t)}}function wt(t){var e=t.target,n=et().contains(e)||$.contains(e);"mousemove"===t.type&&n||function(t,e){var n=e.clientX,r=e.clientY;return t.every((function(t){var e=t.popperRect,o=t.popperState,i=t.props.interactiveBorder,a=l(o.placement),s=o.modifiersData.offset;if(!s)return!0;var u="bottom"===a?s.top.y:0,p="top"===a?s.bottom.y:0,c="right"===a?s.left.x:0,f="left"===a?s.right.x:0,d=e.top-r+u>i,v=r-e.bottom-p>i,m=e.left-n+c>i,g=n-e.right-f>i;return d||v||m||g}))}(At().concat($).map((function(t){var e,n=null==(e=t._tippy.popperInstance)?void 0:e.state;return n?{popperRect:t.getBoundingClientRect(),popperState:n,props:P}:null})).filter(Boolean),t)&&(pt(),Dt(t))}function xt(t){Ot(t)||Y.props.trigger.indexOf("click")>=0&&V||(Y.props.interactive?Y.hideWithInteractivity(t):Dt(t))}function Et(t){Y.props.trigger.indexOf("focusin")<0&&t.target!==et()||Y.props.interactive&&t.relatedTarget&&$.contains(t.relatedTarget)||Dt(t)}function Ot(t){return!!T.isTouch&&Z()!==t.type.indexOf("touch")>=0}function Ct(){Tt();var n=Y.props,r=n.popperOptions,o=n.placement,i=n.offset,a=n.getReferenceClientRect,s=n.moveTransition,u=tt()?B($).arrow:null,p=a?{getBoundingClientRect:a,contextElement:a.contextElement||et()}:e,c=[{name:"offset",options:{offset:i}},{name:"preventOverflow",options:{padding:{top:2,bottom:2,left:5,right:5}}},{name:"flip",options:{padding:5}},{name:"computeStyles",options:{adaptive:!s}},{name:"$$tippy",enabled:!0,phase:"beforeWrite",requires:["computeStyles"],fn:function(t){var e=t.state;if(tt()){var n=rt().box;["placement","reference-hidden","escaped"].forEach((function(t){"placement"===t?n.setAttribute("data-placement",e.placement):e.attributes.popper["data-popper-"+t]?n.setAttribute("data-"+t,""):n.removeAttribute("data-"+t)})),e.attributes.popper={}}}}];tt()&&u&&c.push({name:"arrow",options:{element:u,padding:3}}),c.push.apply(c,(null==r?void 0:r.modifiers)||[]),Y.popperInstance=t.createPopper(p,$,Object.assign({},r,{placement:o,onFirstUpdate:L,modifiers:c}))}function Tt(){Y.popperInstance&&(Y.popperInstance.destroy(),Y.popperInstance=null)}function At(){return d($.querySelectorAll("[data-tippy-root]"))}function Lt(t){Y.clearDelayTimeouts(),t&&at("onTrigger",[Y,t]),dt();var e=ot(!0),n=Q(),r=n[0],o=n[1];T.isTouch&&"hold"===r&&o&&(e=o),e?p=setTimeout((function(){Y.show()}),e):Y.show()}function Dt(t){if(Y.clearDelayTimeouts(),at("onUntrigger",[Y,t]),Y.state.isVisible){if(!(Y.props.trigger.indexOf("mouseenter")>=0&&Y.props.trigger.indexOf("click")>=0&&["mouseleave","mousemove"].indexOf(t.type)>=0&&V)){var e=ot(!1);e?g=setTimeout((function(){Y.state.isVisible&&Y.hide()}),e):b=requestAnimationFrame((function(){Y.hide()}))}}else vt()}}function F(t,e){void 0===e&&(e={});var n=R.plugins.concat(e.plugins||[]);document.addEventListener("touchstart",L,r),window.addEventListener("blur",k);var o=Object.assign({},e,{plugins:n}),i=y(t).reduce((function(t,e){var n=e&&z(e,o);return n&&t.push(n),t}),[]);return g(t)?i[0]:i}F.defaultProps=R,F.setDefaultProps=function(t){Object.keys(t).forEach((function(e){R[e]=t[e]}))},F.currentInput=T;var W=Object.assign({},t.applyStyles,{effect:function(t){var e=t.state,n={popper:{position:e.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};Object.assign(e.elements.popper.style,n.popper),e.styles=n,e.elements.arrow&&Object.assign(e.elements.arrow.style,n.arrow)}}),X={mouseover:"mouseenter",focusin:"focus",click:"click"};var Y={name:"animateFill",defaultValue:!1,fn:function(t){var e;if(null==(e=t.props.render)||!e.$$tippy)return{};var n=B(t.popper),r=n.box,o=n.content,i=t.props.animateFill?function(){var t=m();return t.className="tippy-backdrop",x([t],"hidden"),t}():null;return{onCreate:function(){i&&(r.insertBefore(i,r.firstElementChild),r.setAttribute("data-animatefill",""),r.style.overflow="hidden",t.setProps({arrow:!1,animation:"shift-away"}))},onMount:function(){if(i){var t=r.style.transitionDuration,e=Number(t.replace("ms",""));o.style.transitionDelay=Math.round(e/10)+"ms",i.style.transitionDuration=t,x([i],"visible")}},onShow:function(){i&&(i.style.transitionDuration="0ms")},onHide:function(){i&&x([i],"hidden")}}}};var q={clientX:0,clientY:0},$=[];function J(t){var e=t.clientX,n=t.clientY;q={clientX:e,clientY:n}}var G={name:"followCursor",defaultValue:!1,fn:function(t){var e=t.reference,n=E(t.props.triggerTarget||e),r=!1,o=!1,i=!0,a=t.props;function s(){return"initial"===t.props.followCursor&&t.state.isVisible}function u(){n.addEventListener("mousemove",f)}function p(){n.removeEventListener("mousemove",f)}function c(){r=!0,t.setProps({getReferenceClientRect:null}),r=!1}function f(n){var r=!n.target||e.contains(n.target),o=t.props.followCursor,i=n.clientX,a=n.clientY,s=e.getBoundingClientRect(),u=i-s.left,p=a-s.top;!r&&t.props.interactive||t.setProps({getReferenceClientRect:function(){var t=e.getBoundingClientRect(),n=i,r=a;"initial"===o&&(n=t.left+u,r=t.top+p);var s="horizontal"===o?t.top:r,c="vertical"===o?t.right:n,f="horizontal"===o?t.bottom:r,l="vertical"===o?t.left:n;return{width:c-l,height:f-s,top:s,right:c,bottom:f,left:l}}})}function l(){t.props.followCursor&&($.push({instance:t,doc:n}),function(t){t.addEventListener("mousemove",J)}(n))}function d(){0===($=$.filter((function(e){return e.instance!==t}))).filter((function(t){return t.doc===n})).length&&function(t){t.removeEventListener("mousemove",J)}(n)}return{onCreate:l,onDestroy:d,onBeforeUpdate:function(){a=t.props},onAfterUpdate:function(e,n){var i=n.followCursor;r||void 0!==i&&a.followCursor!==i&&(d(),i?(l(),!t.state.isMounted||o||s()||u()):(p(),c()))},onMount:function(){t.props.followCursor&&!o&&(i&&(f(q),i=!1),s()||u())},onTrigger:function(t,e){h(e)&&(q={clientX:e.clientX,clientY:e.clientY}),o="focus"===e.type},onHidden:function(){t.props.followCursor&&(c(),p(),i=!0)}}}};var K={name:"inlinePositioning",defaultValue:!1,fn:function(t){var e,n=t.reference;var r=-1,o=!1,i=[],a={name:"tippyInlinePositioning",enabled:!0,phase:"afterWrite",fn:function(o){var a=o.state;t.props.inlinePositioning&&(-1!==i.indexOf(a.placement)&&(i=[]),e!==a.placement&&-1===i.indexOf(a.placement)&&(i.push(a.placement),t.setProps({getReferenceClientRect:function(){return function(t){return function(t,e,n,r){if(n.length<2||null===t)return e;if(2===n.length&&r>=0&&n[0].left>n[1].right)return n[r]||e;switch(t){case"top":case"bottom":var o=n[0],i=n[n.length-1],a="top"===t,s=o.top,u=i.bottom,p=a?o.left:i.left,c=a?o.right:i.right;return{top:s,bottom:u,left:p,right:c,width:c-p,height:u-s};case"left":case"right":var f=Math.min.apply(Math,n.map((function(t){return t.left}))),l=Math.max.apply(Math,n.map((function(t){return t.right}))),d=n.filter((function(e){return"left"===t?e.left===f:e.right===l})),v=d[0].top,m=d[d.length-1].bottom;return{top:v,bottom:m,left:f,right:l,width:l-f,height:m-v};default:return e}}(l(t),n.getBoundingClientRect(),d(n.getClientRects()),r)}(a.placement)}})),e=a.placement)}};function s(){var e;o||(e=function(t,e){var n;return{popperOptions:Object.assign({},t.popperOptions,{modifiers:[].concat(((null==(n=t.popperOptions)?void 0:n.modifiers)||[]).filter((function(t){return t.name!==e.name})),[e])})}}(t.props,a),o=!0,t.setProps(e),o=!1)}return{onCreate:s,onAfterUpdate:s,onTrigger:function(e,n){if(h(n)){var o=d(t.reference.getClientRects()),i=o.find((function(t){return t.left-2<=n.clientX&&t.right+2>=n.clientX&&t.top-2<=n.clientY&&t.bottom+2>=n.clientY})),a=o.indexOf(i);r=a>-1?a:r}},onHidden:function(){r=-1}}}};var Q={name:"sticky",defaultValue:!1,fn:function(t){var e=t.reference,n=t.popper;function r(e){return!0===t.props.sticky||t.props.sticky===e}var o=null,i=null;function a(){var s=r("reference")?(t.popperInstance?t.popperInstance.state.elements.reference:e).getBoundingClientRect():null,u=r("popper")?n.getBoundingClientRect():null;(s&&Z(o,s)||u&&Z(i,u))&&t.popperInstance&&t.popperInstance.update(),o=s,i=u,t.state.isMounted&&requestAnimationFrame(a)}return{onMount:function(){t.props.sticky&&a()}}}};function Z(t,e){return!t||!e||(t.top!==e.top||t.right!==e.right||t.bottom!==e.bottom||t.left!==e.left)}return e&&function(t){var e=document.createElement("style");e.textContent=t,e.setAttribute("data-tippy-stylesheet","");var n=document.head,r=document.querySelector("head>style,head>link");r?n.insertBefore(e,r):n.appendChild(e)}('.tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;white-space:normal;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:"";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}'),F.setDefaultProps({plugins:[Y,G,K,Q],render:N}),F.createSingleton=function(t,e){var n;void 0===e&&(e={});var r,o=t,i=[],a=[],s=e.overrides,u=[],f=!1;function l(){a=o.map((function(t){return c(t.props.triggerTarget||t.reference)})).reduce((function(t,e){return t.concat(e)}),[])}function d(){i=o.map((function(t){return t.reference}))}function v(t){o.forEach((function(e){t?e.enable():e.disable()}))}function g(t){return o.map((function(e){var n=e.setProps;return e.setProps=function(o){n(o),e.reference===r&&t.setProps(o)},function(){e.setProps=n}}))}function h(t,e){var n=a.indexOf(e);if(e!==r){r=e;var u=(s||[]).concat("content").reduce((function(t,e){return t[e]=o[n].props[e],t}),{});t.setProps(Object.assign({},u,{getReferenceClientRect:"function"==typeof u.getReferenceClientRect?u.getReferenceClientRect:function(){var t;return null==(t=i[n])?void 0:t.getBoundingClientRect()}}))}}v(!1),d(),l();var b={fn:function(){return{onDestroy:function(){v(!0)},onHidden:function(){r=null},onClickOutside:function(t){t.props.showOnCreate&&!f&&(f=!0,r=null)},onShow:function(t){t.props.showOnCreate&&!f&&(f=!0,h(t,i[0]))},onTrigger:function(t,e){h(t,e.currentTarget)}}}},y=F(m(),Object.assign({},p(e,["overrides"]),{plugins:[b].concat(e.plugins||[]),triggerTarget:a,popperOptions:Object.assign({},e.popperOptions,{modifiers:[].concat((null==(n=e.popperOptions)?void 0:n.modifiers)||[],[W])})})),w=y.show;y.show=function(t){if(w(),!r&&null==t)return h(y,i[0]);if(!r||null!=t){if("number"==typeof t)return i[t]&&h(y,i[t]);if(o.indexOf(t)>=0){var e=t.reference;return h(y,e)}return i.indexOf(t)>=0?h(y,t):void 0}},y.showNext=function(){var t=i[0];if(!r)return y.show(0);var e=i.indexOf(r);y.show(i[e+1]||t)},y.showPrevious=function(){var t=i[i.length-1];if(!r)return y.show(t);var e=i.indexOf(r),n=i[e-1]||t;y.show(n)};var x=y.setProps;return y.setProps=function(t){s=t.overrides||s,x(t)},y.setInstances=function(t){v(!0),u.forEach((function(t){return t()})),o=t,v(!1),d(),l(),u=g(y),y.setProps({triggerTarget:a})},u=g(y),y},F.delegate=function(t,e){var n=[],o=[],i=!1,a=e.target,s=p(e,["target"]),u=Object.assign({},s,{trigger:"manual",touch:!1}),f=Object.assign({touch:R.touch},s,{showOnCreate:!0}),l=F(t,u);function d(t){if(t.target&&!i){var n=t.target.closest(a);if(n){var r=n.getAttribute("data-tippy-trigger")||e.trigger||R.trigger;if(!n._tippy&&!("touchstart"===t.type&&"boolean"==typeof f.touch||"touchstart"!==t.type&&r.indexOf(X[t.type])<0)){var s=F(n,f);s&&(o=o.concat(s))}}}}function v(t,e,r,o){void 0===o&&(o=!1),t.addEventListener(e,r,o),n.push({node:t,eventType:e,handler:r,options:o})}return c(l).forEach((function(t){var e=t.destroy,a=t.enable,s=t.disable;t.destroy=function(t){void 0===t&&(t=!0),t&&o.forEach((function(t){t.destroy()})),o=[],n.forEach((function(t){var e=t.node,n=t.eventType,r=t.handler,o=t.options;e.removeEventListener(n,r,o)})),n=[],e()},t.enable=function(){a(),o.forEach((function(t){return t.enable()})),i=!1},t.disable=function(){s(),o.forEach((function(t){return t.disable()})),i=!0},function(t){var e=t.reference;v(e,"touchstart",d,r),v(e,"mouseover",d),v(e,"focusin",d),v(e,"click",d)}(t)})),l},F.hideAll=function(t){var e=void 0===t?{}:t,n=e.exclude,r=e.duration;_.forEach((function(t){var e=!1;if(n&&(e=b(n)?t.reference===n:t.popper===n.popper),!e){var o=t.props.duration;t.setProps({duration:r}),t.hide(),t.state.isDestroyed||t.setProps({duration:o})}}))},F.roundArrow='<svg width="16" height="6" xmlns="http://www.w3.org/2000/svg"><path d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"></svg>',F}));
//# sourceMappingURL=tippy-bundle.umd.min.js.mapURL=index.min.js.map

/* CountUp */
!function(a,n){"function"==typeof define&&define.amd?define(n):"object"==typeof exports?module.exports=n(require,exports,module):a.CountUp=n()}(this,function(a,n,t){return function(a,n,t,e,i,r){var u=this;if(u.version=function(){return"1.9.3"},u.options={useEasing:!0,useGrouping:!0,separator:",",decimal:".",easingFn:function(a,n,t,e){return t*(1-Math.pow(2,-10*a/e))*1024/1023+n},formattingFn:function(a){var n,t,e,i,r,o,s=a<0;if(a=Math.abs(a).toFixed(u.decimals),n=(a+="").split("."),t=n[0],e=1<n.length?u.options.decimal+n[1]:"",u.options.useGrouping){for(i="",r=0,o=t.length;r<o;++r)0!==r&&r%3==0&&(i=u.options.separator+i),i=t[o-r-1]+i;t=i}return u.options.numerals.length&&(t=t.replace(/[0-9]/g,function(a){return u.options.numerals[+a]}),e=e.replace(/[0-9]/g,function(a){return u.options.numerals[+a]})),(s?"-":"")+u.options.prefix+t+e+u.options.suffix},prefix:"",suffix:"",numerals:[]},r&&"object"==typeof r)for(var o in u.options)r.hasOwnProperty(o)&&null!==r[o]&&(u.options[o]=r[o]);""===u.options.separator?u.options.useGrouping=!1:u.options.separator=""+u.options.separator;for(var s=0,l=["webkit","moz","ms","o"],m=0;m<l.length&&!window.requestAnimationFrame;++m)window.requestAnimationFrame=window[l[m]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[l[m]+"CancelAnimationFrame"]||window[l[m]+"CancelRequestAnimationFrame"];function d(a){return"number"==typeof a&&!isNaN(a)}window.requestAnimationFrame||(window.requestAnimationFrame=function(a,n){var t=(new Date).getTime(),e=Math.max(0,16-(t-s)),i=window.setTimeout(function(){a(t+e)},e);return s=t+e,i}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)}),u.initialize=function(){return!!u.initialized||(u.error="",u.d="string"==typeof a?document.getElementById(a):a,u.d?(u.startVal=Number(n),u.endVal=Number(t),d(u.startVal)&&d(u.endVal)?(u.decimals=Math.max(0,e||0),u.dec=Math.pow(10,u.decimals),u.duration=1e3*Number(i)||2e3,u.countDown=u.startVal>u.endVal,u.frameVal=u.startVal,u.initialized=!0):(u.error="[CountUp] startVal ("+n+") or endVal ("+t+") is not a number",!1)):!(u.error="[CountUp] target is null or undefined"))},u.printValue=function(a){var n=u.options.formattingFn(a);"INPUT"===u.d.tagName?this.d.value=n:"text"===u.d.tagName||"tspan"===u.d.tagName?this.d.textContent=n:this.d.innerHTML=n},u.count=function(a){u.startTime||(u.startTime=a);var n=(u.timestamp=a)-u.startTime;u.remaining=u.duration-n,u.options.useEasing?u.countDown?u.frameVal=u.startVal-u.options.easingFn(n,0,u.startVal-u.endVal,u.duration):u.frameVal=u.options.easingFn(n,u.startVal,u.endVal-u.startVal,u.duration):u.countDown?u.frameVal=u.startVal-(u.startVal-u.endVal)*(n/u.duration):u.frameVal=u.startVal+(u.endVal-u.startVal)*(n/u.duration),u.countDown?u.frameVal=u.frameVal<u.endVal?u.endVal:u.frameVal:u.frameVal=u.frameVal>u.endVal?u.endVal:u.frameVal,u.frameVal=Math.round(u.frameVal*u.dec)/u.dec,u.printValue(u.frameVal),n<u.duration?u.rAF=requestAnimationFrame(u.count):u.callback&&u.callback()},u.start=function(a){u.initialize()&&(u.callback=a,u.rAF=requestAnimationFrame(u.count))},u.pauseResume=function(){u.paused?(u.paused=!1,delete u.startTime,u.duration=u.remaining,u.startVal=u.frameVal,requestAnimationFrame(u.count)):(u.paused=!0,cancelAnimationFrame(u.rAF))},u.reset=function(){u.paused=!1,delete u.startTime,u.initialized=!1,u.initialize()&&(cancelAnimationFrame(u.rAF),u.printValue(u.startVal))},u.update=function(a){u.initialize()&&(d(a=Number(a))?(u.error="",a!==u.frameVal&&(cancelAnimationFrame(u.rAF),u.paused=!1,delete u.startTime,u.startVal=u.frameVal,u.endVal=a,u.countDown=u.startVal>u.endVal,u.rAF=requestAnimationFrame(u.count))):u.error="[CountUp] update() - new endVal is not a number: "+a)},u.initialize()&&u.printValue(u.startVal)}});

/*! lazysizes - v5.1.2 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}("undefined"!=typeof window?window:{},function(a,b){"use strict";var c,d;if(function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0,ricTimeout:0,throttleDelay:125};d=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in d||(d[b]=c[b])}(),!b||!b.getElementsByClassName)return{init:function(){},cfg:d,noSupport:!0};var e=b.documentElement,f=a.Date,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h],k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,d,e,f,g){var h=b.createEvent("Event");return e||(e={}),e.instance=c,h.initEvent(d,!f,!g),h.detail=e,a.dispatchEvent(h),h},w=function(b,c){var e;!g&&(e=a.picturefill||d.pf)?(c&&c.src&&!b[i]("srcset")&&b.setAttribute("srcset",c.src),e({reevaluate:!0,elements:[b]})):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<d.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,c=0,e=d.throttleDelay,g=d.ricTimeout,h=function(){b=!1,c=f.now(),a()},i=m&&g>49?function(){m(h,{timeout:g}),g!==d.ricTimeout&&(g=d.ricTimeout)}:A(function(){k(h)},!0);return function(a){var d;(a=!0===a)&&(g=33),b||(b=!0,d=e-(f.now()-c),d<0&&(d=0),a||d<9?i():k(i,d))}},C=function(a){var b,c,d=99,e=function(){b=null,a()},g=function(){var a=f.now()-c;a<d?k(g,d-a):(m||e)(e)};return function(){c=f.now(),b||(b=k(g,d))}},D=function(){var g,m,o,p,y,D,F,G,H,I,J,K,L=/^img$/i,M=/^iframe$/i,N="onscroll"in a&&!/(gle|ing)bot/.test(navigator.userAgent),O=0,P=0,Q=0,R=-1,S=function(a){Q--,(!a||Q<0||!a.target)&&(Q=0)},T=function(a){return null==K&&(K="hidden"==x(b.body,"visibility")),K||!("hidden"==x(a.parentNode,"visibility")&&"hidden"==x(a,"visibility"))},U=function(a,c){var d,f=a,g=T(a);for(G-=c,J+=c,H-=c,I+=c;g&&(f=f.offsetParent)&&f!=b.body&&f!=e;)(g=(x(f,"opacity")||1)>0)&&"visible"!=x(f,"overflow")&&(d=f.getBoundingClientRect(),g=I>d.left&&H<d.right&&J>d.top-1&&G<d.bottom+1);return g},V=function(){var a,f,h,j,k,l,n,o,q,r,s,t,u=c.elements;if((p=d.loadMode)&&Q<8&&(a=u.length)){for(f=0,R++;f<a;f++)if(u[f]&&!u[f]._lazyRace)if(!N||c.prematureUnveil&&c.prematureUnveil(u[f]))ba(u[f]);else if((o=u[f][i]("data-expand"))&&(l=1*o)||(l=P),r||(r=!d.expand||d.expand<1?e.clientHeight>500&&e.clientWidth>500?500:370:d.expand,c._defEx=r,s=r*d.expFactor,t=d.hFac,K=null,P<s&&Q<1&&R>2&&p>2&&!b.hidden?(P=s,R=0):P=p>1&&R>1&&Q<6?r:O),q!==l&&(D=innerWidth+l*t,F=innerHeight+l,n=-1*l,q=l),h=u[f].getBoundingClientRect(),(J=h.bottom)>=n&&(G=h.top)<=F&&(I=h.right)>=n*t&&(H=h.left)<=D&&(J||I||H||G)&&(d.loadHidden||T(u[f]))&&(m&&Q<3&&!o&&(p<3||R<4)||U(u[f],l))){if(ba(u[f]),k=!0,Q>9)break}else!k&&m&&!j&&Q<4&&R<4&&p>2&&(g[0]||d.preloadAfterLoad)&&(g[0]||!o&&(J||I||H||G||"auto"!=u[f][i](d.sizesAttr)))&&(j=g[0]||u[f]);j&&!k&&ba(j)}},W=B(V),X=function(a){var b=a.target;if(b._lazyCache)return void delete b._lazyCache;S(a),s(b,d.loadedClass),t(b,d.loadingClass),u(b,Z),v(b,"lazyloaded")},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](d.srcsetAttr);(b=d.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,e,f){var g,h,j,l,m,p;(m=v(a,"lazybeforeunveil",b)).defaultPrevented||(e&&(c?s(a,d.autosizesClass):a.setAttribute("sizes",e)),h=a[i](d.srcsetAttr),g=a[i](d.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),m={target:a},s(a,d.loadingClass),p&&(clearTimeout(o),o=k(S,2500),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(M.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,d.lazyClass),z(function(){var b=a.complete&&a.naturalWidth>1;p&&!b||(b&&s(a,"ls-is-cached"),X(m),a._lazyCache=!0,k(function(){"_lazyCache"in a&&delete a._lazyCache},9)),"lazy"==a.loading&&Q--},!0)}),ba=function(a){if(!a._lazyRace){var b,c=L.test(a.nodeName),e=c&&(a[i](d.sizesAttr)||a[i]("sizes")),f="auto"==e;(!f&&m||!c||!a[i]("src")&&!a.srcset||a.complete||r(a,d.errorClass)||!r(a,d.lazyClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,Q++,aa(a,b,f,e,c))}},ca=C(function(){d.loadMode=3,W()}),da=function(){3==d.loadMode&&(d.loadMode=2),ca()},ea=function(){if(!m){if(f.now()-y<999)return void k(ea,999);m=!0,d.loadMode=3,W(),j("scroll",da,!0)}};return{_:function(){y=f.now(),c.elements=b.getElementsByClassName(d.lazyClass),g=b.getElementsByClassName(d.lazyClass+" "+d.preloadClass),j("scroll",W,!0),j("resize",W,!0),j("pageshow",function(a){if(a.persisted){var c=b.querySelectorAll("."+d.loadingClass);c.length&&c.forEach&&l(function(){c.forEach(function(a){a.complete&&ba(a)})})}}),a.MutationObserver?new MutationObserver(W).observe(e,{childList:!0,subtree:!0,attributes:!0}):(e[h]("DOMNodeInserted",W,!0),e[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ea():(j("load",ea),b[h]("DOMContentLoaded",W),k(ea,2e4)),c.elements.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba,_aLSL:da}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;f<g;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),e=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width)&&d!==a._lazysizesWidth&&c(a,f,e,d))},f=function(){var b,c=a.length;if(c)for(b=0;b<c;b++)e(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(d.autosizesClass),j("resize",g)},checkElems:g,updateElem:e}}(),F=function(){!F.i&&b.getElementsByClassName&&(F.i=!0,E._(),D._())};return k(function(){d.init&&F()}),c={cfg:d,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}});

/* Lazy Sizes bg */
/*! lazysizes - v4.0.3 */
!function(a,b){var c=function(){b(a.lazySizes),a.removeEventListener("lazyunveilread",c,!0)};b=b.bind(null,a,a.document),"object"==typeof module&&module.exports?b(require("lazysizes")):a.lazySizes?c():a.addEventListener("lazyunveilread",c,!0)}(window,function(a,b,c){"use strict";function d(a,c){if(!g[a]){var d=b.createElement(c?"link":"script"),e=b.getElementsByTagName("script")[0];c?(d.rel="stylesheet",d.href=a):d.src=a,g[a]=!0,g[d.src||d.href]=!0,e.parentNode.insertBefore(d,e)}}var e,f,g={};b.addEventListener&&(f=/\(|\)|\s|'/,e=function(a,c){var d=b.createElement("img");d.onload=function(){d.onload=null,d.onerror=null,d=null,c()},d.onerror=d.onload,d.src=a,d&&d.complete&&d.onload&&d.onload()},addEventListener("lazybeforeunveil",function(a){if(a.detail.instance==c){var b,g,h,i;a.defaultPrevented||("none"==a.target.preload&&(a.target.preload="auto"),b=a.target.getAttribute("data-link"),b&&d(b,!0),b=a.target.getAttribute("data-script"),b&&d(b),b=a.target.getAttribute("data-require"),b&&(c.cfg.requireJs?c.cfg.requireJs([b]):d(b)),h=a.target.getAttribute("data-bg"),h&&(a.detail.firesLoad=!0,g=function(){a.target.style.backgroundImage="url("+(f.test(h)?JSON.stringify(h):h)+")",a.detail.firesLoad=!1,c.fire(a.target,"_lazyloaded",{},!0,!0)},e(h,g)),i=a.target.getAttribute("data-poster"),i&&(a.detail.firesLoad=!0,g=function(){a.target.poster=i,a.detail.firesLoad=!1,c.fire(a.target,"_lazyloaded",{},!0,!0)},e(i,g)))}},!1))});

/* IntersectionObserver Polyfill */
!function(t,e){"use strict";if("IntersectionObserver"in t&&"IntersectionObserverEntry"in t&&"intersectionRatio"in t.IntersectionObserverEntry.prototype)"isIntersecting"in t.IntersectionObserverEntry.prototype||Object.defineProperty(t.IntersectionObserverEntry.prototype,"isIntersecting",{get:function(){return this.intersectionRatio>0}});else{var n=[];i.prototype.THROTTLE_TIMEOUT=100,i.prototype.POLL_INTERVAL=null,i.prototype.USE_MUTATION_OBSERVER=!0,i.prototype.observe=function(t){if(!this._observationTargets.some(function(e){return e.element==t})){if(!t||1!=t.nodeType)throw new Error("target must be an Element");this._registerInstance(),this._observationTargets.push({element:t,entry:null}),this._monitorIntersections(),this._checkForIntersections()}},i.prototype.unobserve=function(t){this._observationTargets=this._observationTargets.filter(function(e){return e.element!=t}),this._observationTargets.length||(this._unmonitorIntersections(),this._unregisterInstance())},i.prototype.disconnect=function(){this._observationTargets=[],this._unmonitorIntersections(),this._unregisterInstance()},i.prototype.takeRecords=function(){var t=this._queuedEntries.slice();return this._queuedEntries=[],t},i.prototype._initThresholds=function(t){var e=t||[0];return Array.isArray(e)||(e=[e]),e.sort().filter(function(t,e,n){if("number"!=typeof t||isNaN(t)||t<0||t>1)throw new Error("threshold must be a number between 0 and 1 inclusively");return t!==n[e-1]})},i.prototype._parseRootMargin=function(t){var e=(t||"0px").split(/\s+/).map(function(t){var e=/^(-?\d*\.?\d+)(px|%)$/.exec(t);if(!e)throw new Error("rootMargin must be specified in pixels or percent");return{value:parseFloat(e[1]),unit:e[2]}});return e[1]=e[1]||e[0],e[2]=e[2]||e[0],e[3]=e[3]||e[1],e},i.prototype._monitorIntersections=function(){this._monitoringIntersections||(this._monitoringIntersections=!0,this.POLL_INTERVAL?this._monitoringInterval=setInterval(this._checkForIntersections,this.POLL_INTERVAL):(r(t,"resize",this._checkForIntersections,!0),r(e,"scroll",this._checkForIntersections,!0),this.USE_MUTATION_OBSERVER&&"MutationObserver"in t&&(this._domObserver=new MutationObserver(this._checkForIntersections),this._domObserver.observe(e,{attributes:!0,childList:!0,characterData:!0,subtree:!0}))))},i.prototype._unmonitorIntersections=function(){this._monitoringIntersections&&(this._monitoringIntersections=!1,clearInterval(this._monitoringInterval),this._monitoringInterval=null,s(t,"resize",this._checkForIntersections,!0),s(e,"scroll",this._checkForIntersections,!0),this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null))},i.prototype._checkForIntersections=function(){var e=this._rootIsInDom(),n=e?this._getRootRect():{top:0,bottom:0,left:0,right:0,width:0,height:0};this._observationTargets.forEach(function(i){var r=i.element,s=h(r),c=this._rootContainsTarget(r),a=i.entry,u=e&&c&&this._computeTargetAndRootIntersection(r,n),l=i.entry=new o({time:t.performance&&performance.now&&performance.now(),target:r,boundingClientRect:s,rootBounds:n,intersectionRect:u});a?e&&c?this._hasCrossedThreshold(a,l)&&this._queuedEntries.push(l):a&&a.isIntersecting&&this._queuedEntries.push(l):this._queuedEntries.push(l)},this),this._queuedEntries.length&&this._callback(this.takeRecords(),this)},i.prototype._computeTargetAndRootIntersection=function(n,o){if("none"!=t.getComputedStyle(n).display){for(var i,r,s,c,u,l,p,d,g=h(n),f=a(n),_=!1;!_;){var v=null,m=1==f.nodeType?t.getComputedStyle(f):{};if("none"==m.display)return;if(f==this.root||f==e?(_=!0,v=o):f!=e.body&&f!=e.documentElement&&"visible"!=m.overflow&&(v=h(f)),v&&(i=v,r=g,s=void 0,c=void 0,u=void 0,l=void 0,p=void 0,d=void 0,s=Math.max(i.top,r.top),c=Math.min(i.bottom,r.bottom),u=Math.max(i.left,r.left),l=Math.min(i.right,r.right),d=c-s,!(g=(p=l-u)>=0&&d>=0&&{top:s,bottom:c,left:u,right:l,width:p,height:d})))break;f=a(f)}return g}},i.prototype._getRootRect=function(){var t;if(this.root)t=h(this.root);else{var n=e.documentElement,o=e.body;t={top:0,left:0,right:n.clientWidth||o.clientWidth,width:n.clientWidth||o.clientWidth,bottom:n.clientHeight||o.clientHeight,height:n.clientHeight||o.clientHeight}}return this._expandRectByRootMargin(t)},i.prototype._expandRectByRootMargin=function(t){var e=this._rootMarginValues.map(function(e,n){return"px"==e.unit?e.value:e.value*(n%2?t.width:t.height)/100}),n={top:t.top-e[0],right:t.right+e[1],bottom:t.bottom+e[2],left:t.left-e[3]};return n.width=n.right-n.left,n.height=n.bottom-n.top,n},i.prototype._hasCrossedThreshold=function(t,e){var n=t&&t.isIntersecting?t.intersectionRatio||0:-1,o=e.isIntersecting?e.intersectionRatio||0:-1;if(n!==o)for(var i=0;i<this.thresholds.length;i++){var r=this.thresholds[i];if(r==n||r==o||r<n!=r<o)return!0}},i.prototype._rootIsInDom=function(){return!this.root||c(e,this.root)},i.prototype._rootContainsTarget=function(t){return c(this.root||e,t)},i.prototype._registerInstance=function(){n.indexOf(this)<0&&n.push(this)},i.prototype._unregisterInstance=function(){var t=n.indexOf(this);-1!=t&&n.splice(t,1)},t.IntersectionObserver=i,t.IntersectionObserverEntry=o}function o(t){this.time=t.time,this.target=t.target,this.rootBounds=t.rootBounds,this.boundingClientRect=t.boundingClientRect,this.intersectionRect=t.intersectionRect||{top:0,bottom:0,left:0,right:0,width:0,height:0},this.isIntersecting=!!t.intersectionRect;var e=this.boundingClientRect,n=e.width*e.height,o=this.intersectionRect,i=o.width*o.height;this.intersectionRatio=n?Number((i/n).toFixed(4)):this.isIntersecting?1:0}function i(t,e){var n,o,i,r=e||{};if("function"!=typeof t)throw new Error("callback must be a function");if(r.root&&1!=r.root.nodeType)throw new Error("root must be an Element");this._checkForIntersections=(n=this._checkForIntersections.bind(this),o=this.THROTTLE_TIMEOUT,i=null,function(){i||(i=setTimeout(function(){n(),i=null},o))}),this._callback=t,this._observationTargets=[],this._queuedEntries=[],this._rootMarginValues=this._parseRootMargin(r.rootMargin),this.thresholds=this._initThresholds(r.threshold),this.root=r.root||null,this.rootMargin=this._rootMarginValues.map(function(t){return t.value+t.unit}).join(" ")}function r(t,e,n,o){"function"==typeof t.addEventListener?t.addEventListener(e,n,o||!1):"function"==typeof t.attachEvent&&t.attachEvent("on"+e,n)}function s(t,e,n,o){"function"==typeof t.removeEventListener?t.removeEventListener(e,n,o||!1):"function"==typeof t.detatchEvent&&t.detatchEvent("on"+e,n)}function h(t){var e;try{e=t.getBoundingClientRect()}catch(t){}return e?(e.width&&e.height||(e={top:e.top,right:e.right,bottom:e.bottom,left:e.left,width:e.right-e.left,height:e.bottom-e.top}),e):{top:0,bottom:0,left:0,right:0,width:0,height:0}}function c(t,e){for(var n=e;n;){if(n==t)return!0;n=a(n)}return!1}function a(t){var e=t.parentNode;return e&&11==e.nodeType&&e.host?e.host:e&&e.assignedSlot?e.assignedSlot.parentNode:e}}(window,document);

/*!
 * Splide.js
 * Version  : 2.4.14
 * License  : MIT
 * Copyright: 2020 Naotoshi Fujita
 */
 !function(e){var i={};function o(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=i,o.d=function(t,n,e){o.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:e})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(n,t){if(1&t&&(n=o(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var e=Object.create(null);if(o.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var i in n)o.d(e,i,function(t){return n[t]}.bind(null,i));return e},o.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(n,"a",n),n},o.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},o.p="",o(o.s=0)}([function(t,n,e){"use strict";e.r(n),e.d(n,"Splide",function(){return Tt});var s={};e.r(s),e.d(s,"CREATED",function(){return G}),e.d(s,"MOUNTED",function(){return X}),e.d(s,"IDLE",function(){return V}),e.d(s,"MOVING",function(){return U}),e.d(s,"DESTROYED",function(){return Y});function i(){return(i=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])}return t}).apply(this,arguments)}var b=Object.keys;function m(e,i){b(e).some(function(t,n){return i(e[t],t,n)})}function g(n){return b(n).map(function(t){return n[t]})}function o(t){return"object"==typeof t}function u(t,n){var e=i({},t);return m(n,function(t,n){o(t)?(o(e[n])||(e[n]={}),e[n]=u(e[n],t)):e[n]=t}),e}function r(t){return Array.isArray(t)?t:[t]}function y(t,n,e){return Math.min(Math.max(t,e<n?e:n),e<n?n:e)}function h(t,n){var e=0;return t.replace(/%s/g,function(){return r(n)[e++]})}function w(t){var n=typeof t;return"number"==n&&0<t?parseFloat(t)+"px":"string"==n?t:""}function v(t){return t<10?"0"+t:t}function x(t,n){var e;return"string"==typeof n&&(P(e=f("div",{}),{position:"absolute",width:n}),k(t,e),n=e.clientWidth,E(e)),+n||0}function c(t,n){return t?t.querySelector(n.split(" ")[0]):null}function _(t,n){return d(t,n)[0]}function d(t,n){return t?g(t.children).filter(function(t){return z(t,n.split(" ")[0])||t.tagName===n}):[]}function f(t,n){var e=document.createElement(t);return m(n,function(t,n){return M(e,n,t)}),e}function l(t){var n=f("div",{});return n.innerHTML=t,n.firstChild}function E(t){r(t).forEach(function(t){var n;!t||(n=t.parentElement)&&n.removeChild(t)})}function k(t,n){t&&t.appendChild(n)}function S(t,n){var e;t&&n&&((e=n.parentElement)&&e.insertBefore(t,n))}function P(e,t){e&&m(t,function(t,n){null!==t&&(e.style[n]=t)})}function a(n,t,e){n&&r(t).forEach(function(t){t&&n.classList[e?"remove":"add"](t)})}function C(t,n){a(t,n,!1)}function I(t,n){a(t,n,!0)}function z(t,n){return!!t&&t.classList.contains(n)}function M(t,n,e){t&&t.setAttribute(n,e)}function O(t,n){return t?t.getAttribute(n):""}function A(t,n){r(n).forEach(function(n){r(t).forEach(function(t){return t&&t.removeAttribute(n)})})}function T(t){return t.getBoundingClientRect()}function p(u,c){var d,l;return{mount:function(){d=c.Elements.list,u.on("transitionend",function(t){t.target===d&&l&&l()},d)},start:function(t,n,e,i,o){var r=u.options,s=c.Controller.edgeIndex,a=r.speed;l=o,u.is(j)&&(0===e&&s<=n||s<=e&&0===n)&&(a=r.rewindSpeed||a),P(d,{transition:"transform "+a+"ms "+r.easing,transform:"translate("+i.x+"px,"+i.y+"px)"})}}}function L(e,s){function a(t){var n=e.options;P(s.Elements.slides[t],{transition:"opacity "+n.speed+"ms "+n.easing})}return{mount:function(){a(e.index)},start:function(t,n,e,i,o){var r=s.Elements.track;P(r,{height:w(r.clientHeight)}),a(n),setTimeout(function(){o(),P(r,{height:""})})}}}var j="slide",W="loop",H="fade";var q="[SPLIDE]";function D(t){console.error(q+" "+t)}function N(t,n){if(!t)throw new Error(n)}var R="splide",B={active:"is-active",visible:"is-visible",loading:"is-loading"},F={type:"slide",rewind:!1,speed:400,rewindSpeed:0,waitForTransition:!0,width:0,height:0,fixedWidth:0,fixedHeight:0,heightRatio:0,autoWidth:!1,autoHeight:!1,perPage:1,perMove:0,clones:0,start:0,focus:!1,gap:0,padding:0,arrows:!0,arrowPath:"",pagination:!0,autoplay:!1,interval:5e3,pauseOnHover:!0,pauseOnFocus:!0,resetProgress:!0,lazyLoad:!1,preloadPages:1,easing:"cubic-bezier(.42,.65,.27,.99)",keyboard:"global",drag:!0,dragAngleThreshold:30,swipeDistanceThreshold:150,flickVelocityThreshold:.6,flickPower:600,flickMaxPages:1,direction:"ltr",cover:!1,accessibility:!0,slideFocus:!0,isNavigation:!1,trimSpace:!0,updateOnMove:!1,throttle:100,destroy:!1,breakpoints:!1,classes:{root:R,slider:R+"__slider",track:R+"__track",list:R+"__list",slide:R+"__slide",container:R+"__slide__container",arrows:R+"__arrows",arrow:R+"__arrow",prev:R+"__arrow--prev",next:R+"__arrow--next",pagination:R+"__pagination",page:R+"__pagination__page",clone:R+"__slide--clone",progress:R+"__progress",bar:R+"__progress__bar",autoplay:R+"__autoplay",play:R+"__play",pause:R+"__pause",spinner:R+"__spinner",sr:R+"__sr"},i18n:{prev:"Previous slide",next:"Next slide",first:"Go to first slide",last:"Go to last slide",slideX:"Go to slide %s",pageX:"Go to page %s",play:"Start autoplay",pause:"Pause autoplay"}},G=1,X=2,V=3,U=4,Y=5;function J(t,n){for(var e=0;e<n.length;e++){var i=n[e];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function K(t){var n=O(t.root,"data-splide");if(n)try{t.options=JSON.parse(n)}catch(t){D(t.message)}return{mount:function(){t.State.is(G)&&(t.index=t.options.start)}}}function Q(h,o){var t,i=h.root,r=h.classes,p=[];i.id||(window.splide=window.splide||{},t=window.splide.uid||0,window.splide.uid=++t,i.id="splide"+v(t));var s={mount:function(){var t=this;this.init(),h.on("refresh",function(){t.destroy(),t.init()}).on("updated",function(){I(i,n()),C(i,n())})},destroy:function(){p.forEach(function(t){t.destroy()}),p=[],I(i,n())},init:function(){var e=this;!function(){s.slider=_(i,r.slider),s.track=c(i,"."+r.track),s.list=_(s.track,r.list),N(s.track&&s.list,"Track or list was not found."),s.slides=d(s.list,r.slide);var t=a(r.arrows);s.arrows={prev:c(t,"."+r.prev),next:c(t,"."+r.next)};var n=a(r.autoplay);s.bar=c(a(r.progress),"."+r.bar),s.play=c(n,"."+r.play),s.pause=c(n,"."+r.pause),s.track.id=s.track.id||i.id+"-track",s.list.id=s.list.id||i.id+"-list"}(),C(i,n()),this.slides.forEach(function(t,n){e.register(t,n,-1)})},register:function(t,n,e){var o,i,r,s,a,u,c,d=(i=n,r=e,s=t,a=(o=h).options.updateOnMove,u="ready.slide updated.slide resize.slide moved.slide"+(a?" move.slide":""),c={slide:s,index:i,realIndex:r,container:_(s,o.classes.container),isClone:-1<r,mount:function(){var t=this;this.isClone||(s.id=o.root.id+"-slide"+v(i+1)),o.on(u,function(){return t.update()}).on(ot,f).on("click",function(){return o.emit("click",t)},s),a&&o.on("move.slide",function(t){t===r&&l(!0,!1)}),P(s,{display:""}),this.styles=O(s,"style")||""},destroy:function(){o.off(u).off(ot).off("click",s),I(s,g(B)),f(),A(this.container,"style")},update:function(){l(this.isActive(),!1),l(this.isVisible(),!0)},isActive:function(){return o.index===i},isVisible:function(){var t=this.isActive();if(o.is(H)||t)return t;var n=T(o.Components.Elements.track),e=T(s);return o.options.direction===it?n.top<=e.top&&e.bottom<=n.bottom:n.left<=e.left&&e.right<=n.right},isWithin:function(t,n){var e=Math.abs(t-i);return o.is(j)||this.isClone||(e=Math.min(e,o.length-e)),e<n}});function l(t,n){var e=n?"visible":"active",i=B[e];t?(C(s,i),o.emit(e,c)):z(s,i)&&(I(s,i),o.emit(n?"hidden":"inactive",c))}function f(){M(s,"style",c.styles)}d.mount(),p.push(d)},getSlide:function(n){return p.filter(function(t){return t.index===n})[0]},getSlides:function(t){return t?p:p.filter(function(t){return!t.isClone})},getSlidesByPage:function(t){var e=o.Controller.toIndex(t),n=h.options,i=!1!==n.focus?1:n.perPage;return p.filter(function(t){var n=t.index;return e<=n&&n<e+i})},add:function(t,n,e){var i,o,r,s,a;"string"==typeof t&&(t=l(t)),t instanceof Element&&(i=this.slides[n],P(t,{display:"none"}),i?(S(t,i),this.slides.splice(n,0,t)):(k(this.list,t),this.slides.push(t)),o=function(){e&&e(t)},s=t.querySelectorAll("img"),(a=s.length)?(r=0,m(s,function(t){t.onload=t.onerror=function(){++r===a&&o()}})):o())},remove:function(t){E(this.slides.splice(t,1)[0])},each:function(t){p.forEach(t)},get length(){return this.slides.length},get total(){return p.length}};function n(){var t=r.root,n=h.options;return[t+"--"+n.type,t+"--"+n.direction,n.drag?t+"--draggable":"",n.isNavigation?t+"--nav":"",B.active]}function a(t){return _(i,t)||_(s.slider,t)}return s}function Z(r,i){var s,e,a={mount:function(){s=r.options,e=r.is(W),r.on("move",function(t){r.index=t}).on("updated refresh",function(t){s=t||s,r.index=y(r.index,0,a.edgeIndex)})},go:function(t,n){var e=this.trim(this.parse(t));i.Track.go(e,this.rewind(e),n)},parse:function(t){var n=r.index,e=String(t).match(/([+\-<>]+)(\d+)?/),i=e?e[1]:"",o=e?parseInt(e[2]):0;switch(i){case"+":n+=o||1;break;case"-":n-=o||1;break;case">":case"<":n=function(t,n,e){if(-1<t)return a.toIndex(t);var i=s.perMove,o=e?-1:1;if(i)return n+i*o;return a.toIndex(a.toPage(n)+o)}(o,n,"<"===i);break;default:n=parseInt(t)}return n},toIndex:function(t){if(o())return t;var n=r.length,e=s.perPage,i=t*e;return n-e<=(i-=(this.pageLength*e-n)*rt(i/n))&&i<n&&(i=n-e),i},toPage:function(t){if(o())return t;var n=r.length,e=s.perPage;return rt(n-e<=t&&t<n?(n-1)/e:t/e)},trim:function(t){return e||(t=s.rewind?this.rewind(t):y(t,0,this.edgeIndex)),t},rewind:function(t){var n=this.edgeIndex;if(e){for(;n<t;)t-=n+1;for(;t<0;)t+=n+1}else n<t?t=0:t<0&&(t=n);return t},isRtl:function(){return s.direction===et},get pageLength(){var t=r.length;return o()?t:Math.ceil(t/s.perPage)},get edgeIndex(){var t=r.length;return t?o()||s.isNavigation||e?t-1:t-s.perPage:0},get prevIndex(){var t=r.index-1;return(e||s.rewind)&&(t=this.rewind(t)),-1<t?t:-1},get nextIndex(){var t=r.index+1;return(e||s.rewind)&&(t=this.rewind(t)),r.index<t&&t<=this.edgeIndex||0===t?t:-1}};function o(){return!1!==s.focus}return a}function $(r,s){var i,n,o,e=r.options.direction===it,a=r.is(H),u=r.options.direction===et,c=!1,d=u?1:-1,l={sign:d,mount:function(){n=s.Elements,i=s.Layout,o=n.list},mounted:function(){var t=this;a||(this.jump(0),r.on("mounted resize updated",function(){t.jump(r.index)}))},go:function(t,n,e){var i=h(t),o=r.index;r.State.is(U)&&c||(c=t!==n,e||r.emit("move",n,o,t),1<=Math.abs(i-this.position)||a?s.Transition.start(t,n,o,this.toCoord(i),function(){f(t,n,o,e)}):t!==o&&"move"===r.options.trimSpace?s.Controller.go(t+t-o,e):f(t,n,o,e))},jump:function(t){this.translate(h(t))},translate:function(t){P(o,{transform:"translate"+(e?"Y":"X")+"("+t+"px)"})},cancel:function(){r.is(W)?this.shift():this.translate(this.position),P(o,{transition:""})},shift:function(){var t=st(this.position),n=st(this.toPosition(0)),e=st(this.toPosition(r.length)),i=e-n;t<n?t+=i:e<t&&(t-=i),this.translate(d*t)},trim:function(t){return!r.options.trimSpace||r.is(W)?t:y(t,d*(i.totalSize()-i.size-i.gap),0)},toIndex:function(i){var o=this,r=0,s=1/0;return n.getSlides(!0).forEach(function(t){var n=t.index,e=st(o.toPosition(n)-i);e<s&&(s=e,r=n)}),r},toCoord:function(t){return{x:e?0:t,y:e?t:0}},toPosition:function(t){var n=i.totalSize(t)-i.slideSize(t)-i.gap;return d*(n+this.offset(t))},offset:function(t){var n=r.options.focus,e=i.slideSize(t);return"center"===n?-(i.size-e)/2:-(parseInt(n)||0)*(e+i.gap)},get position(){var t=e?"top":u?"right":"left";return T(o)[t]-(T(n.track)[t]-i.padding[t]*d)}};function f(t,n,e,i){P(o,{transition:""}),c=!1,a||l.jump(n),i||r.emit("moved",n,e,t)}function h(t){return l.trim(l.toPosition(t))}return l}function tt(o,t){var a=[],n=0,u=t.Elements,e={mount:function(){var t=this;o.is(W)&&(i(),o.on("refresh",i).on("resize",function(){n!==r()&&(t.destroy(),o.refresh())}))},destroy:function(){E(a),a=[]},get clones(){return a},get length(){return a.length}};function i(){e.destroy(),function(i){var o=u.length,r=u.register;if(o){for(var s=u.slides;s.length<i;)s=s.concat(s);s.slice(0,i).forEach(function(t,n){var e=c(t);k(u.list,e),a.push(e),r(e,n+o,n%o)}),s.slice(-i).forEach(function(t,n){var e=c(t);S(e,s[0]),a.push(e),r(e,n-i,(o+n-i%o)%o)})}}(n=r())}function r(){var t=o.options;if(t.clones)return t.clones;var n=t.autoWidth||t.autoHeight?u.length:t.perPage,e=t.direction===it?"Height":"Width",i=x(o.root,t["fixed"+e]);return i&&(n=Math.ceil(u.track["client"+e]/i)),n*(t.drag?t.flickMaxPages+1:1)}function c(t){var n=t.cloneNode(!0);return C(n,o.classes.clone),A(n,"id"),n}return e}var nt=function(){function t(t,n,e){function i(t){t.elm&&t.elm.removeEventListener(t.event,t.handler,t.options)}var o,r;void 0===n&&(n={}),void 0===e&&(e={}),this.root=t instanceof Element?t:document.querySelector(t),N(this.root,"An invalid element/selector was given."),this.Components=null,this.Event=(o=[],{on:function(t,n,e,i){void 0===e&&(e=null),void 0===i&&(i={}),t.split(" ").forEach(function(t){e&&e.addEventListener(t,n,i),o.push({event:t,handler:n,elm:e,options:i})})},off:function(t,e){void 0===e&&(e=null),t.split(" ").forEach(function(n){o=o.filter(function(t){return!t||t.event!==n||t.elm!==e||(i(t),!1)})})},emit:function(n){for(var t=arguments.length,e=new Array(1<t?t-1:0),i=1;i<t;i++)e[i-1]=arguments[i];o.forEach(function(t){t.elm||t.event.split(".")[0]!==n||t.handler.apply(t,e)})},destroy:function(){o.forEach(i),o=[]}}),this.State=(r=G,{set:function(t){r=t},is:function(t){return t===r}}),this.STATES=s,this._o=u(F,n),this._i=0,this._c=e,this._e={},this._t=null}var n,e,i,o=t.prototype;return o.mount=function(t,n){var e,i,o,r,s=this;void 0===t&&(t=this._e),void 0===n&&(n=this._t),this.State.set(G),this._e=t,this._t=n,this.Components=(i=u((e=this)._c,t),o=n,r={},m(i,function(t,n){r[n]=t(e,r,n.toLowerCase())}),o=o||(e.is(H)?L:p),r.Transition=o(e,r),r);try{m(this.Components,function(t,n){var e=t.required;void 0===e||e?t.mount&&t.mount():delete s.Components[n]})}catch(t){return void D(t.message)}var a=this.State;return a.set(X),m(this.Components,function(t){t.mounted&&t.mounted()}),this.emit("mounted"),a.set(V),this.emit("ready"),P(this.root,{visibility:"visible"}),this.on("move drag",function(){return a.set(U)}).on("moved dragged",function(){return a.set(V)}),this},o.sync=function(t){return this.sibling=t,this},o.on=function(t,n,e,i){return void 0===e&&(e=null),void 0===i&&(i={}),this.Event.on(t,n,e,i),this},o.off=function(t,n){return void 0===n&&(n=null),this.Event.off(t,n),this},o.emit=function(t){for(var n,e=arguments.length,i=new Array(1<e?e-1:0),o=1;o<e;o++)i[o-1]=arguments[o];return(n=this.Event).emit.apply(n,[t].concat(i)),this},o.go=function(t,n){return void 0===n&&(n=this.options.waitForTransition),(this.State.is(V)||this.State.is(U)&&!n)&&this.Components.Controller.go(t,!1),this},o.is=function(t){return t===this._o.type},o.add=function(t,n){return void 0===n&&(n=-1),this.Components.Elements.add(t,n,this.refresh.bind(this)),this},o.remove=function(t){return this.Components.Elements.remove(t),this.refresh(),this},o.refresh=function(){return this.emit("refresh").emit("resize"),this},o.destroy=function(n){var t=this;if(void 0===n&&(n=!0),!this.State.is(G))return g(this.Components).reverse().forEach(function(t){t.destroy&&t.destroy(n)}),this.emit("destroy",n),this.Event.destroy(),this.State.set(Y),this;this.on("ready",function(){return t.destroy(n)})},n=t,(e=[{key:"index",get:function(){return this._i},set:function(t){this._i=parseInt(t)}},{key:"length",get:function(){return this.Components.Elements.length}},{key:"options",get:function(){return this._o},set:function(t){var n=this.State.is(G);n||this.emit("update"),this._o=u(this._o,t),n||this.emit("updated",this._o)}},{key:"classes",get:function(){return this._o.classes}},{key:"i18n",get:function(){return this._o.i18n}}])&&J(n.prototype,e),i&&J(n,i),t}(),et="rtl",it="ttb",ot="update.slide",rt=Math.floor,st=Math.abs;function at(t,n){var e;return function(){e=e||setTimeout(function(){t(),e=null},n)}}function ut(n,e,i){function o(t){c||(r||(r=t,a&&a<1&&(r-=a*e)),a=(s=t-r)/e,e<=s&&(r=0,a=1,n()),i&&i(a),u(o))}var r,s,a,u=window.requestAnimationFrame,c=!0;return{pause:function(){c=!0,r=0},play:function(t){r=0,c&&(c=!1,t&&(a=0),u(o))}}}function ct(t,n){var e,i,r,o,s,a,u,c,d,l,f,h,p=n.Elements,g=t.options.direction===it,v=(e={mount:function(){t.on("resize load",at(function(){t.emit("resize")},t.options.throttle),window).on("resize",y).on("updated refresh",m),m(),this.totalSize=g?this.totalHeight:this.totalWidth,this.slideSize=g?this.slideHeight:this.slideWidth},destroy:function(){A([p.list,p.track],"style")},get size(){return g?this.height:this.width}},i=g?(c=t,f=n.Elements,h=c.root,{margin:"marginBottom",init:function(){this.resize()},resize:function(){l=c.options,d=f.track,this.gap=x(h,l.gap);var t=l.padding,n=x(h,t.top||t),e=x(h,t.bottom||t);this.padding={top:n,bottom:e},P(d,{paddingTop:w(n),paddingBottom:w(e)})},totalHeight:function(t){void 0===t&&(t=c.length-1);var n=f.getSlide(t);return n?T(n.slide).bottom-T(f.list).top+this.gap:0},slideWidth:function(){return x(h,l.fixedWidth||this.width)},slideHeight:function(t){if(l.autoHeight){var n=f.getSlide(t);return n?n.slide.offsetHeight:0}var e=l.fixedHeight||(this.height+this.gap)/l.perPage-this.gap;return x(h,e)},get width(){return d.clientWidth},get height(){var t=l.height||this.width*l.heightRatio;return N(t,'"height" or "heightRatio" is missing.'),x(h,t)-this.padding.top-this.padding.bottom}}):(r=t,s=n.Elements,a=r.root,{margin:"margin"+((u=r.options).direction===et?"Left":"Right"),height:0,init:function(){this.resize()},resize:function(){u=r.options,o=s.track,this.gap=x(a,u.gap);var t=u.padding,n=x(a,t.left||t),e=x(a,t.right||t);this.padding={left:n,right:e},P(o,{paddingLeft:w(n),paddingRight:w(e)})},totalWidth:function(t){void 0===t&&(t=r.length-1);var n,e,i=s.getSlide(t),o=0;return i&&(n=T(i.slide),e=T(s.list),o=u.direction===et?e.right-n.left:n.right-e.left,o+=this.gap),o},slideWidth:function(t){if(u.autoWidth){var n=s.getSlide(t);return n?n.slide.offsetWidth:0}var e=u.fixedWidth||(this.width+this.gap)/u.perPage-this.gap;return x(a,e)},slideHeight:function(){var t=u.height||u.fixedHeight||this.width*u.heightRatio;return x(a,t)},get width(){return o.clientWidth-this.padding.left-this.padding.right}}),b(i).forEach(function(t){e[t]||Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}),e);function m(){v.init(),P(t.root,{maxWidth:w(t.options.width)}),p.each(function(t){t.slide.style[v.margin]=w(v.gap)}),y()}function y(){var n=t.options;v.resize(),P(p.track,{height:w(v.height)});var e=n.autoHeight?null:w(v.slideHeight());p.each(function(t){P(t.container,{height:e}),P(t.slide,{width:n.autoWidth?null:w(v.slideWidth(t.index)),height:t.container?null:e})})}return v}function dt(u,c){var e,i,o,r,d=c.Track,l=c.Controller,s=u.options.direction===it,f=s?"y":"x",n={disabled:!1,mount:function(){var t=this,n=c.Elements,e=n.track;u.on("touchstart mousedown",a,e).on("touchmove mousemove",p,e,{passive:!1}).on("touchend touchcancel mouseleave mouseup dragend",g,e).on("mounted refresh",function(){m(n.list.querySelectorAll("img, a"),function(t){u.off("dragstart",t).on("dragstart",function(t){t.preventDefault()},t,{passive:!1})})}).on("mounted updated",function(){t.disabled=!u.options.drag})}};function a(t){n.disabled||r||h(t)}function h(t){e=d.toCoord(d.position),i=v(t,{}),o=i}function p(t){var n;i&&(o=v(t,i),r?(t.cancelable&&t.preventDefault(),u.is(H)||(n=e[f]+o.offset[f],d.translate(function(t){{var n,e,i;u.is(j)&&(n=d.sign,e=n*d.trim(d.toPosition(0)),i=n*d.trim(d.toPosition(l.edgeIndex)),(t*=n)<e?t=e-7*Math.log(e-t):i<t&&(t=i+7*Math.log(t-i)),t*=n)}return t}(n)))):function(t){var n=t.offset;if(u.State.is(U)&&u.options.waitForTransition)return!1;var e=180*Math.atan(gt(n.y)/gt(n.x))/Math.PI;s&&(e=90-e);return e<u.options.dragAngleThreshold}(o)&&(u.emit("drag",i),r=!0,d.cancel(),h(t)))}function g(){i=null,r&&(u.emit("dragged",o),function(t){var n=t.velocity[f],e=gt(n);{var i,o,r,s,a;0<e&&(i=u.options,o=u.index,r=n<0?-1:1,s=o,u.is(H)||(a=d.position,e>i.flickVelocityThreshold&&gt(t.offset[f])<i.swipeDistanceThreshold&&(a+=r*Math.min(e*i.flickPower,c.Layout.size*(i.flickMaxPages||1))),s=d.toIndex(a)),s===o&&.1<e&&(s=o+r*d.sign),u.is(j)&&(s=y(s,0,l.edgeIndex)),l.go(s,i.isNavigation))}}(o),r=!1)}function v(t,n){var e=t.timeStamp,i=t.touches,o=i?i[0]:t,r=o.clientX,s=o.clientY,a=n.to||{},u=a.x,c=a.y,d={x:r-(void 0===u?r:u),y:s-(void 0===c?s:c)},l=e-(n.time||0);return{to:{x:r,y:s},offset:d,time:e,velocity:{x:d.x/l,y:d.y/l}}}return n}function lt(t,n){var e=!1;function i(t){e&&(t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation())}return{required:t.options.drag,mount:function(){t.on("click",i,n.Elements.track,{capture:!0}).on("drag",function(){e=!0}).on("moved",function(){e=!1})}}}function ft(o,r,s){var a,u,t,i=o.classes,c=o.root,d=r.Elements;function n(){var t=r.Controller,n=t.prevIndex,e=t.nextIndex,i=o.length>o.options.perPage||o.is(W);a.disabled=n<0||!i,u.disabled=e<0||!i,o.emit(s+":updated",a,u,n,e)}function e(t){return l('<button class="'+i.arrow+" "+(t?i.prev:i.next)+'" type="button"><svg xmlns="http://www.w3.org/2000/svg"\tviewBox="0 0 40 40"\twidth="40"\theight="40"><path d="'+(o.options.arrowPath||"m15.5 0.932-4.3 4.38 14.5 14.6-14.5 14.5 4.3 4.4 14.6-14.6 4.4-4.3-4.4-4.4-14.6-14.6z")+'" />')}return{required:o.options.arrows,mount:function(){a=d.arrows.prev,u=d.arrows.next,a&&u||!o.options.arrows||(a=e(!0),u=e(!1),t=!0,function(){var t=f("div",{class:i.arrows});k(t,a),k(t,u);var n=d.slider,e="slider"===o.options.arrows&&n?n:c;S(t,e.firstElementChild)}()),a&&u&&o.on("click",function(){o.go("<")},a).on("click",function(){o.go(">")},u).on("mounted move updated refresh",n),this.arrows={prev:a,next:u}},mounted:function(){o.emit(s+":mounted",a,u)},destroy:function(){A([a,u],"disabled"),t&&E(a.parentElement)}}}function ht(s,n,r){var a={},u=n.Elements,c={mount:function(){var t,n,o,r,e,i=s.options.pagination;i&&(n=s.options,o=s.classes,r=f("ul",{class:o.pagination}),e=u.getSlides(!1).filter(function(t){return!1!==n.focus||t.index%n.perPage==0}).map(function(t,n){var e=f("li",{}),i=f("button",{class:o.page,type:"button"});return k(e,i),k(r,e),s.on("click",function(){s.go(">"+n)},i),{li:e,button:i,page:n,Slides:u.getSlidesByPage(n)}}),a={list:r,items:e},t=u.slider,k("slider"===i&&t?t:s.root,a.list),s.on(bt,d)),s.off(wt).on(wt,function(){c.destroy(),s.options.pagination&&(c.mount(),c.mounted())})},mounted:function(){var t;s.options.pagination&&(t=s.index,s.emit(r+":mounted",a,this.getItem(t)),d(t,-1))},destroy:function(){E(a.list),a.items&&a.items.forEach(function(t){s.off("click",t.button)}),s.off(bt),a={}},getItem:function(t){return a.items[n.Controller.toPage(t)]},get data(){return a}};function d(t,n){var e=c.getItem(n),i=c.getItem(t),o=B.active;e&&I(e.button,o),i&&C(i.button,o),s.emit(r+":updated",a,e,i)}return c}function pt(a,e){var u=a.i18n,i=e.Elements,o=[Pt,Ct,kt,St,Et,"role"];function n(t,n){M(t,Pt,!n),a.options.slideFocus&&M(t,Ct,n?0:-1)}function t(t,n){var e=i.track.id;M(t,kt,e),M(n,kt,e)}function r(t,n,e,i){var o=a.index,r=-1<e&&o<e?u.last:u.prev,s=-1<i&&i<o?u.first:u.next;M(t,St,r),M(n,St,s)}function s(t,n){n&&M(n.button,Et,!0),t.items.forEach(function(t){var n=a.options,e=h(!1===n.focus&&1<n.perPage?u.pageX:u.slideX,t.page+1),i=t.button,o=t.Slides.map(function(t){return t.slide.id});M(i,kt,o.join(" ")),M(i,St,e)})}function c(t,n,e){n&&A(n.button,Et),e&&M(e.button,Et,!0)}function d(s){i.each(function(t){var n=t.slide,e=t.realIndex;f(n)||M(n,"role","button");var i=-1<e?e:t.index,o=h(u.slideX,i+1),r=s.Components.Elements.getSlide(i);M(n,St,o),r&&M(n,kt,r.slide.id)})}function l(t,n){var e=t.slide;n?M(e,Et,!0):A(e,Et)}function f(t){return"BUTTON"===t.tagName}return{required:a.options.accessibility,mount:function(){a.on("visible",function(t){n(t.slide,!0)}).on("hidden",function(t){n(t.slide,!1)}).on("arrows:mounted",t).on("arrows:updated",r).on("pagination:mounted",s).on("pagination:updated",c).on("refresh",function(){A(e.Clones.clones,o)}),a.options.isNavigation&&a.on("navigation:mounted navigation:updated",d).on("active",function(t){l(t,!0)}).on("inactive",function(t){l(t,!1)}),["play","pause"].forEach(function(t){var n=i[t];n&&(f(n)||M(n,"role","button"),M(n,kt,i.track.id),M(n,St,u[t]))})},destroy:function(){var t=e.Arrows,n=t?t.arrows:{};A(i.slides.concat([n.prev,n.next,i.play,i.pause]),o)}}}var gt=Math.abs,vt=1,mt=2,yt=3,bt="move.page",wt="updated.page refresh.page",xt="data-splide-lazy",_t="data-splide-lazy-srcset",Et="aria-current",kt="aria-controls",St="aria-label",Pt="aria-hidden",Ct="tabindex",It={ltr:{ArrowLeft:"<",ArrowRight:">",Left:"<",Right:">"},rtl:{ArrowLeft:">",ArrowRight:"<",Left:">",Right:"<"},ttb:{ArrowUp:"<",ArrowDown:">",Up:"<",Down:">"}},zt="move.sync",Mt="mouseup touchend",Ot=[" ","Enter","Spacebar"],At={Options:K,Breakpoints:function(r){var s,a,u=r.options.breakpoints,n=at(t,50),c=[];function t(){var t,n,e,i,o=(t=c.filter(function(t){return t.mql.matches})[0])?t.point:-1;o!==a&&(a=o,n=r.State,(i=(e=u[o]||s).destroy)?(r.options=s,r.destroy("completely"===i)):(n.is(Y)&&r.mount(),r.options=e))}return{required:u&&matchMedia,mount:function(){c=Object.keys(u).sort(function(t,n){return t-n}).map(function(t){return{point:t,mql:matchMedia("(max-width:"+t+"px)")}}),this.destroy(!0),addEventListener("resize",n),s=r.options,t()},destroy:function(t){t&&removeEventListener("resize",n)}}},Controller:Z,Elements:Q,Track:$,Clones:tt,Layout:ct,Drag:dt,Click:lt,Autoplay:function(o,t,e){var i,r=[],s=t.Elements,a={required:o.options.autoplay,mount:function(){var t=o.options;s.slides.length>t.perPage&&(i=ut(function(){o.go(">")},t.interval,function(t){o.emit(e+":playing",t),s.bar&&P(s.bar,{width:100*t+"%"})}),function(){var t=o.options,n=o.sibling,e=[o.root,n?n.root:null];t.pauseOnHover&&(u(e,"mouseleave",vt,!0),u(e,"mouseenter",vt,!1));t.pauseOnFocus&&(u(e,"focusout",mt,!0),u(e,"focusin",mt,!1));s.play&&o.on("click",function(){a.play(mt),a.play(yt)},s.play);s.pause&&u([s.pause],"click",yt,!1);o.on("move refresh",function(){a.play()}).on("destroy",function(){a.pause()})}(),this.play())},play:function(n){void 0===n&&(n=0),(r=r.filter(function(t){return t!==n})).length||(o.emit(e+":play"),i.play(o.options.resetProgress))},pause:function(t){void 0===t&&(t=0),i.pause(),-1===r.indexOf(t)&&r.push(t),1===r.length&&o.emit(e+":pause")}};function u(t,n,e,i){t.forEach(function(t){o.on(n,function(){a[i?"play":"pause"](e)},t)})}return a},Cover:function(t,n){function e(e){n.Elements.each(function(t){var n=_(t.slide,"IMG")||_(t.container,"IMG");n&&n.src&&i(n,e)})}function i(t,n){P(t.parentElement,{background:n?"":'center/cover no-repeat url("'+t.src+'")'}),P(t,{display:n?"":"none"})}return{required:t.options.cover,mount:function(){t.on("lazyload:loaded",function(t){i(t,!1)}),t.on("mounted updated refresh",function(){return e(!1)})},destroy:function(){e(!0)}}},Arrows:ft,Pagination:ht,LazyLoad:function(o,t,r){var n,e,i=o.options,s="sequential"===i.lazyLoad;function a(){e=[],n=0}function u(n){n=isNaN(n)?o.index:n,(e=e.filter(function(t){return!t.Slide.isWithin(n,i.perPage*(i.preloadPages+1))||(c(t.img,t.Slide),!1)}))[0]||o.off("moved."+r)}function c(t,n){C(n.slide,B.loading);var e=f("span",{class:o.classes.spinner});k(t.parentElement,e),t.onload=function(){l(t,e,n,!1)},t.onerror=function(){l(t,e,n,!0)},M(t,"srcset",O(t,_t)||""),M(t,"src",O(t,xt)||"")}function d(){var t;n<e.length&&c((t=e[n]).img,t.Slide),n++}function l(t,n,e,i){I(e.slide,B.loading),i||(E(n),P(t,{display:""}),o.emit(r+":loaded",t).emit("resize")),s&&d()}return{required:i.lazyLoad,mount:function(){o.on("mounted refresh",function(){a(),t.Elements.each(function(n){m(n.slide.querySelectorAll("["+xt+"], ["+_t+"]"),function(t){t.src||t.srcset||(e.push({img:t,Slide:n}),P(t,{display:"none"}))})}),s&&d()}),s||o.on("mounted refresh moved."+r,u)},destroy:a}},Keyboard:function(o){var r;return{mount:function(){o.on("mounted updated",function(){var t=o.options,n=o.root,e=It[t.direction],i=t.keyboard;r&&(o.off("keydown",r),A(n,Ct)),i&&("focused"===i?M(r=n,Ct,0):r=document,o.on("keydown",function(t){e[t.key]&&o.go(e[t.key])},r))})}}},Sync:function(i){var o=i.sibling,t=o&&o.options.isNavigation;function r(){i.on(zt,function(t,n,e){o.off(zt).go(o.is(W)?e:t,!1),s()})}function s(){o.on(zt,function(t,n,e){i.off(zt).go(i.is(W)?e:t,!1),r()})}function n(){o.Components.Elements.each(function(t){var n=t.slide,e=t.index;i.off(Mt,n).on(Mt,function(t){t.button&&0!==t.button||a(e)},n),i.off("keyup",n).on("keyup",function(t){-1<Ot.indexOf(t.key)&&(t.preventDefault(),a(e))},n,{passive:!1})})}function a(t){i.State.is(V)&&o.go(t)}return{required:!!o,mount:function(){r(),s(),t&&(n(),i.on("refresh",function(){setTimeout(function(){n(),o.emit("navigation:updated",i)})}))},mounted:function(){t&&o.emit("navigation:mounted",i)}}},A11y:pt};var Tt=function(e){var t,n;function i(t,n){return e.call(this,t,n,At)||this}return n=e,(t=i).prototype=Object.create(n.prototype),(t.prototype.constructor=t).__proto__=n,i}(nt);window.Splide=Tt}]);


/* GLightbox */
 !function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).GLightbox=t()}(this,(function(){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function n(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}function s(e){return function(e){if(Array.isArray(e))return l(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return l(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);"Object"===i&&e.constructor&&(i=e.constructor.name);if("Map"===i||"Set"===i)return Array.from(e);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return l(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var i=0,n=new Array(t);i<t;i++)n[i]=e[i];return n}var o=Date.now();function r(){var e={},t=!0,i=0,n=arguments.length;"[object Boolean]"===Object.prototype.toString.call(arguments[0])&&(t=arguments[0],i++);for(var s=function(i){for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t&&"[object Object]"===Object.prototype.toString.call(i[n])?e[n]=r(!0,e[n],i[n]):e[n]=i[n])};i<n;i++){var l=arguments[i];s(l)}return e}function a(e,t){if((A(e)||e===window||e===document)&&(e=[e]),O(e)||P(e)||(e=[e]),0!=X(e))if(O(e)&&!P(e))for(var i=e.length,n=0;n<i&&!1!==t.call(e[n],e[n],n,e);n++);else if(P(e))for(var s in e)if(I(e,s)&&!1===t.call(e[s],e[s],s,e))break}function h(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,n=e[o]=e[o]||[],s={all:n,evt:null,found:null};return t&&i&&X(n)>0&&a(n,(function(e,n){if(e.eventName==t&&e.fn.toString()==i.toString())return s.found=!0,s.evt=n,!1})),s}function c(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=t.onElement,n=t.withCallback,s=t.avoidDuplicate,l=void 0===s||s,o=t.once,r=void 0!==o&&o,c=t.useCapture,d=void 0!==c&&c,u=arguments.length>2?arguments[2]:void 0,g=i||[];function v(e){C(n)&&n.call(u,e,this),r&&v.destroy()}return E(g)&&(g=document.querySelectorAll(g)),v.destroy=function(){a(g,(function(t){var i=h(t,e,v);i.found&&i.all.splice(i.evt,1),t.removeEventListener&&t.removeEventListener(e,v,d)}))},a(g,(function(t){var i=h(t,e,v);(t.addEventListener&&l&&!i.found||!l)&&(t.addEventListener(e,v,d),i.all.push({eventName:e,fn:v}))})),v}function d(e,t){a(t.split(" "),(function(t){return e.classList.add(t)}))}function u(e,t){a(t.split(" "),(function(t){return e.classList.remove(t)}))}function g(e,t){return e.classList.contains(t)}function v(e,t){for(;e!==document.body;){if(!(e=e.parentElement))return!1;if("function"==typeof e.matches?e.matches(t):e.msMatchesSelector(t))return e}}function f(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!e||""===t)return!1;if("none"==t)return C(i)&&i(),!1;var n=S(),s=t.split(" ");a(s,(function(t){d(e,"g"+t)})),c(n,{onElement:e,avoidDuplicate:!1,once:!0,withCallback:function(e,t){a(s,(function(e){u(t,"g"+e)})),C(i)&&i()}})}function p(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";if(""==t)return e.style.webkitTransform="",e.style.MozTransform="",e.style.msTransform="",e.style.OTransform="",e.style.transform="",!1;e.style.webkitTransform=t,e.style.MozTransform=t,e.style.msTransform=t,e.style.OTransform=t,e.style.transform=t}function m(e){e.style.display="block"}function y(e){e.style.display="none"}function b(e){var t=document.createDocumentFragment(),i=document.createElement("div");for(i.innerHTML=e;i.firstChild;)t.appendChild(i.firstChild);return t}function x(){return{width:window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,height:window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight}}function S(){var e,t=document.createElement("fakeelement"),i={animation:"animationend",OAnimation:"oAnimationEnd",MozAnimation:"animationend",WebkitAnimation:"webkitAnimationEnd"};for(e in i)if(void 0!==t.style[e])return i[e]}function w(e,t,i,n){if(e())t();else{var s;i||(i=100);var l=setInterval((function(){e()&&(clearInterval(l),s&&clearTimeout(s),t())}),i);n&&(s=setTimeout((function(){clearInterval(l)}),n))}}function T(e,t,i){if(M(e))console.error("Inject videos api error");else{var n;if(C(t)&&(i=t,t=!1),-1!==e.indexOf(".css")){if((n=document.querySelectorAll('link[href="'+e+'"]'))&&n.length>0)return void(C(i)&&i());var s=document.getElementsByTagName("head")[0],l=s.querySelectorAll('link[rel="stylesheet"]'),o=document.createElement("link");return o.rel="stylesheet",o.type="text/css",o.href=e,o.media="all",l?s.insertBefore(o,l[0]):s.appendChild(o),void(C(i)&&i())}if((n=document.querySelectorAll('script[src="'+e+'"]'))&&n.length>0){if(C(i)){if(E(t))return w((function(){return void 0!==window[t]}),(function(){i()})),!1;i()}}else{var r=document.createElement("script");r.type="text/javascript",r.src=e,r.onload=function(){if(C(i)){if(E(t))return w((function(){return void 0!==window[t]}),(function(){i()})),!1;i()}},document.body.appendChild(r)}}}function k(){return"navigator"in window&&window.navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i)}function C(e){return"function"==typeof e}function E(e){return"string"==typeof e}function A(e){return!(!e||!e.nodeType||1!=e.nodeType)}function L(e){return Array.isArray(e)}function O(e){return e&&e.length&&isFinite(e.length)}function P(t){return"object"===e(t)&&null!=t&&!C(t)&&!L(t)}function M(e){return null==e}function I(e,t){return null!==e&&hasOwnProperty.call(e,t)}function X(e){if(P(e)){if(e.keys)return e.keys().length;var t=0;for(var i in e)I(e,i)&&t++;return t}return e.length}function z(e){return!isNaN(parseFloat(e))&&isFinite(e)}function Y(e){if(e.events.hasOwnProperty("keyboard"))return!1;e.events.keyboard=c("keydown",{onElement:window,withCallback:function(t,i){var n=(t=t||window.event).keyCode;if(9==n){var l=!(!document.activeElement||!document.activeElement.nodeName)&&document.activeElement.nodeName.toLocaleLowerCase();if("input"==l||"textarea"==l||"button"==l)return;t.preventDefault();var o=document.querySelectorAll(".gbtn");if(!o||o.length<=0)return;var r=s(o).filter((function(e){return g(e,"focused")}));if(!r.length){var a=document.querySelector('.gbtn[tabindex="0"]');return void(a&&(a.focus(),d(a,"focused")))}o.forEach((function(e){return u(e,"focused")}));var h=r[0].getAttribute("tabindex");h=h||"0";var c=parseInt(h)+1;c>o.length-1&&(c="0");var v=document.querySelector('.gbtn[tabindex="'.concat(c,'"]'));v&&(v.focus(),d(v,"focused"))}39==n&&e.nextSlide(),37==n&&e.prevSlide(),27==n&&e.close()}})}function q(e){return Math.sqrt(e.x*e.x+e.y*e.y)}function D(e,t){var i=function(e,t){var i=q(e)*q(t);if(0===i)return 0;var n=function(e,t){return e.x*t.x+e.y*t.y}(e,t)/i;return n>1&&(n=1),Math.acos(n)}(e,t);return function(e,t){return e.x*t.y-t.x*e.y}(e,t)>0&&(i*=-1),180*i/Math.PI}var _=function(){function e(i){t(this,e),this.handlers=[],this.el=i}return n(e,[{key:"add",value:function(e){this.handlers.push(e)}},{key:"del",value:function(e){e||(this.handlers=[]);for(var t=this.handlers.length;t>=0;t--)this.handlers[t]===e&&this.handlers.splice(t,1)}},{key:"dispatch",value:function(){for(var e=0,t=this.handlers.length;e<t;e++){var i=this.handlers[e];"function"==typeof i&&i.apply(this.el,arguments)}}}]),e}();function N(e,t){var i=new _(e);return i.add(t),i}var B=function(){function e(i,n){t(this,e),this.element="string"==typeof i?document.querySelector(i):i,this.start=this.start.bind(this),this.move=this.move.bind(this),this.end=this.end.bind(this),this.cancel=this.cancel.bind(this),this.element.addEventListener("touchstart",this.start,!1),this.element.addEventListener("touchmove",this.move,!1),this.element.addEventListener("touchend",this.end,!1),this.element.addEventListener("touchcancel",this.cancel,!1),this.preV={x:null,y:null},this.pinchStartLen=null,this.zoom=1,this.isDoubleTap=!1;var s=function(){};this.rotate=N(this.element,n.rotate||s),this.touchStart=N(this.element,n.touchStart||s),this.multipointStart=N(this.element,n.multipointStart||s),this.multipointEnd=N(this.element,n.multipointEnd||s),this.pinch=N(this.element,n.pinch||s),this.swipe=N(this.element,n.swipe||s),this.tap=N(this.element,n.tap||s),this.doubleTap=N(this.element,n.doubleTap||s),this.longTap=N(this.element,n.longTap||s),this.singleTap=N(this.element,n.singleTap||s),this.pressMove=N(this.element,n.pressMove||s),this.twoFingerPressMove=N(this.element,n.twoFingerPressMove||s),this.touchMove=N(this.element,n.touchMove||s),this.touchEnd=N(this.element,n.touchEnd||s),this.touchCancel=N(this.element,n.touchCancel||s),this._cancelAllHandler=this.cancelAll.bind(this),window.addEventListener("scroll",this._cancelAllHandler),this.delta=null,this.last=null,this.now=null,this.tapTimeout=null,this.singleTapTimeout=null,this.longTapTimeout=null,this.swipeTimeout=null,this.x1=this.x2=this.y1=this.y2=null,this.preTapPosition={x:null,y:null}}return n(e,[{key:"start",value:function(e){if(e.touches){this.now=Date.now(),this.x1=e.touches[0].pageX,this.y1=e.touches[0].pageY,this.delta=this.now-(this.last||this.now),this.touchStart.dispatch(e,this.element),null!==this.preTapPosition.x&&(this.isDoubleTap=this.delta>0&&this.delta<=250&&Math.abs(this.preTapPosition.x-this.x1)<30&&Math.abs(this.preTapPosition.y-this.y1)<30,this.isDoubleTap&&clearTimeout(this.singleTapTimeout)),this.preTapPosition.x=this.x1,this.preTapPosition.y=this.y1,this.last=this.now;var t=this.preV;if(e.touches.length>1){this._cancelLongTap(),this._cancelSingleTap();var i={x:e.touches[1].pageX-this.x1,y:e.touches[1].pageY-this.y1};t.x=i.x,t.y=i.y,this.pinchStartLen=q(t),this.multipointStart.dispatch(e,this.element)}this._preventTap=!1,this.longTapTimeout=setTimeout(function(){this.longTap.dispatch(e,this.element),this._preventTap=!0}.bind(this),750)}}},{key:"move",value:function(e){if(e.touches){var t=this.preV,i=e.touches.length,n=e.touches[0].pageX,s=e.touches[0].pageY;if(this.isDoubleTap=!1,i>1){var l=e.touches[1].pageX,o=e.touches[1].pageY,r={x:e.touches[1].pageX-n,y:e.touches[1].pageY-s};null!==t.x&&(this.pinchStartLen>0&&(e.zoom=q(r)/this.pinchStartLen,this.pinch.dispatch(e,this.element)),e.angle=D(r,t),this.rotate.dispatch(e,this.element)),t.x=r.x,t.y=r.y,null!==this.x2&&null!==this.sx2?(e.deltaX=(n-this.x2+l-this.sx2)/2,e.deltaY=(s-this.y2+o-this.sy2)/2):(e.deltaX=0,e.deltaY=0),this.twoFingerPressMove.dispatch(e,this.element),this.sx2=l,this.sy2=o}else{if(null!==this.x2){e.deltaX=n-this.x2,e.deltaY=s-this.y2;var a=Math.abs(this.x1-this.x2),h=Math.abs(this.y1-this.y2);(a>10||h>10)&&(this._preventTap=!0)}else e.deltaX=0,e.deltaY=0;this.pressMove.dispatch(e,this.element)}this.touchMove.dispatch(e,this.element),this._cancelLongTap(),this.x2=n,this.y2=s,i>1&&e.preventDefault()}}},{key:"end",value:function(e){if(e.changedTouches){this._cancelLongTap();var t=this;e.touches.length<2&&(this.multipointEnd.dispatch(e,this.element),this.sx2=this.sy2=null),this.x2&&Math.abs(this.x1-this.x2)>30||this.y2&&Math.abs(this.y1-this.y2)>30?(e.direction=this._swipeDirection(this.x1,this.x2,this.y1,this.y2),this.swipeTimeout=setTimeout((function(){t.swipe.dispatch(e,t.element)}),0)):(this.tapTimeout=setTimeout((function(){t._preventTap||t.tap.dispatch(e,t.element),t.isDoubleTap&&(t.doubleTap.dispatch(e,t.element),t.isDoubleTap=!1)}),0),t.isDoubleTap||(t.singleTapTimeout=setTimeout((function(){t.singleTap.dispatch(e,t.element)}),250))),this.touchEnd.dispatch(e,this.element),this.preV.x=0,this.preV.y=0,this.zoom=1,this.pinchStartLen=null,this.x1=this.x2=this.y1=this.y2=null}}},{key:"cancelAll",value:function(){this._preventTap=!0,clearTimeout(this.singleTapTimeout),clearTimeout(this.tapTimeout),clearTimeout(this.longTapTimeout),clearTimeout(this.swipeTimeout)}},{key:"cancel",value:function(e){this.cancelAll(),this.touchCancel.dispatch(e,this.element)}},{key:"_cancelLongTap",value:function(){clearTimeout(this.longTapTimeout)}},{key:"_cancelSingleTap",value:function(){clearTimeout(this.singleTapTimeout)}},{key:"_swipeDirection",value:function(e,t,i,n){return Math.abs(e-t)>=Math.abs(i-n)?e-t>0?"Left":"Right":i-n>0?"Up":"Down"}},{key:"on",value:function(e,t){this[e]&&this[e].add(t)}},{key:"off",value:function(e,t){this[e]&&this[e].del(t)}},{key:"destroy",value:function(){return this.singleTapTimeout&&clearTimeout(this.singleTapTimeout),this.tapTimeout&&clearTimeout(this.tapTimeout),this.longTapTimeout&&clearTimeout(this.longTapTimeout),this.swipeTimeout&&clearTimeout(this.swipeTimeout),this.element.removeEventListener("touchstart",this.start),this.element.removeEventListener("touchmove",this.move),this.element.removeEventListener("touchend",this.end),this.element.removeEventListener("touchcancel",this.cancel),this.rotate.del(),this.touchStart.del(),this.multipointStart.del(),this.multipointEnd.del(),this.pinch.del(),this.swipe.del(),this.tap.del(),this.doubleTap.del(),this.longTap.del(),this.singleTap.del(),this.pressMove.del(),this.twoFingerPressMove.del(),this.touchMove.del(),this.touchEnd.del(),this.touchCancel.del(),this.preV=this.pinchStartLen=this.zoom=this.isDoubleTap=this.delta=this.last=this.now=this.tapTimeout=this.singleTapTimeout=this.longTapTimeout=this.swipeTimeout=this.x1=this.x2=this.y1=this.y2=this.preTapPosition=this.rotate=this.touchStart=this.multipointStart=this.multipointEnd=this.pinch=this.swipe=this.tap=this.doubleTap=this.longTap=this.singleTap=this.pressMove=this.touchMove=this.touchEnd=this.touchCancel=this.twoFingerPressMove=null,window.removeEventListener("scroll",this._cancelAllHandler),null}}]),e}();function W(e){var t=function(){var e,t=document.createElement("fakeelement"),i={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(e in i)if(void 0!==t.style[e])return i[e]}(),i=g(e,"gslide-media")?e:e.querySelector(".gslide-media"),n=e.querySelector(".gslide-description");d(i,"greset"),p(i,"translate3d(0, 0, 0)");c(t,{onElement:i,once:!0,withCallback:function(e,t){u(i,"greset")}});i.style.opacity="",n&&(n.style.opacity="")}function H(e){if(e.events.hasOwnProperty("touch"))return!1;var t,i,n,s=x(),l=s.width,o=s.height,r=!1,a=null,h=null,c=null,f=!1,m=1,y=1,b=!1,S=!1,w=null,T=null,k=null,C=null,E=0,A=0,L=!1,O=!1,P={},M={},I=0,X=0,z=document.getElementById("glightbox-slider"),Y=document.querySelector(".goverlay"),q=new B(z,{touchStart:function(t){if(g(t.targetTouches[0].target,"ginner-container")||v(t.targetTouches[0].target,".gslide-desc"))return r=!1,!1;r=!0,M=t.targetTouches[0],P.pageX=t.targetTouches[0].pageX,P.pageY=t.targetTouches[0].pageY,I=t.targetTouches[0].clientX,X=t.targetTouches[0].clientY,a=e.activeSlide,h=a.querySelector(".gslide-media"),n=a.querySelector(".gslide-inline"),c=null,g(h,"gslide-image")&&(c=h.querySelector("img")),u(Y,"greset"),t.pageX>20&&t.pageX<window.innerWidth-20||t.preventDefault()},touchMove:function(s){if(r&&(M=s.targetTouches[0],!b&&!S)){if(n&&n.offsetHeight>o){var a=P.pageX-M.pageX;if(Math.abs(a)<=13)return!1}f=!0;var d,u=s.targetTouches[0].clientX,g=s.targetTouches[0].clientY,v=I-u,m=X-g;if(Math.abs(v)>Math.abs(m)?(L=!1,O=!0):(O=!1,L=!0),t=M.pageX-P.pageX,E=100*t/l,i=M.pageY-P.pageY,A=100*i/o,L&&c&&(d=1-Math.abs(i)/o,Y.style.opacity=d,e.settings.touchFollowAxis&&(E=0)),O&&(d=1-Math.abs(t)/l,h.style.opacity=d,e.settings.touchFollowAxis&&(A=0)),!c)return p(h,"translate3d(".concat(E,"%, 0, 0)"));p(h,"translate3d(".concat(E,"%, ").concat(A,"%, 0)"))}},touchEnd:function(){if(r){if(f=!1,S||b)return k=w,void(C=T);var t=Math.abs(parseInt(A)),i=Math.abs(parseInt(E));if(!(t>29&&c))return t<29&&i<25?(d(Y,"greset"),Y.style.opacity=1,W(h)):void 0;e.close()}},multipointEnd:function(){setTimeout((function(){b=!1}),50)},multipointStart:function(){b=!0,m=y||1},pinch:function(e){if(!c||f)return!1;b=!0,c.scaleX=c.scaleY=m*e.zoom;var t=m*e.zoom;if(S=!0,t<=1)return S=!1,t=1,C=null,k=null,w=null,T=null,void c.setAttribute("style","");t>4.5&&(t=4.5),c.style.transform="scale3d(".concat(t,", ").concat(t,", 1)"),y=t},pressMove:function(e){if(S&&!b){var t=M.pageX-P.pageX,i=M.pageY-P.pageY;k&&(t+=k),C&&(i+=C),w=t,T=i;var n="translate3d(".concat(t,"px, ").concat(i,"px, 0)");y&&(n+=" scale3d(".concat(y,", ").concat(y,", 1)")),p(c,n)}},swipe:function(t){if(!S)if(b)b=!1;else{if("Left"==t.direction){if(e.index==e.elements.length-1)return W(h);e.nextSlide()}if("Right"==t.direction){if(0==e.index)return W(h);e.prevSlide()}}}});e.events.touch=q}var j=function(){function e(i,n){var s=this,l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(t(this,e),this.img=i,this.slide=n,this.onclose=l,this.img.setZoomEvents)return!1;this.active=!1,this.zoomedIn=!1,this.dragging=!1,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.img.addEventListener("mousedown",(function(e){return s.dragStart(e)}),!1),this.img.addEventListener("mouseup",(function(e){return s.dragEnd(e)}),!1),this.img.addEventListener("mousemove",(function(e){return s.drag(e)}),!1),this.img.addEventListener("click",(function(e){return s.slide.classList.contains("dragging-nav")?(s.zoomOut(),!1):s.zoomedIn?void(s.zoomedIn&&!s.dragging&&s.zoomOut()):s.zoomIn()}),!1),this.img.setZoomEvents=!0}return n(e,[{key:"zoomIn",value:function(){var e=this.widowWidth();if(!(this.zoomedIn||e<=768)){var t=this.img;if(t.setAttribute("data-style",t.getAttribute("style")),t.style.maxWidth=t.naturalWidth+"px",t.style.maxHeight=t.naturalHeight+"px",t.naturalWidth>e){var i=e/2-t.naturalWidth/2;this.setTranslate(this.img.parentNode,i,0)}this.slide.classList.add("zoomed"),this.zoomedIn=!0}}},{key:"zoomOut",value:function(){this.img.parentNode.setAttribute("style",""),this.img.setAttribute("style",this.img.getAttribute("data-style")),this.slide.classList.remove("zoomed"),this.zoomedIn=!1,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.onclose&&"function"==typeof this.onclose&&this.onclose()}},{key:"dragStart",value:function(e){e.preventDefault(),this.zoomedIn?("touchstart"===e.type?(this.initialX=e.touches[0].clientX-this.xOffset,this.initialY=e.touches[0].clientY-this.yOffset):(this.initialX=e.clientX-this.xOffset,this.initialY=e.clientY-this.yOffset),e.target===this.img&&(this.active=!0,this.img.classList.add("dragging"))):this.active=!1}},{key:"dragEnd",value:function(e){var t=this;e.preventDefault(),this.initialX=this.currentX,this.initialY=this.currentY,this.active=!1,setTimeout((function(){t.dragging=!1,t.img.isDragging=!1,t.img.classList.remove("dragging")}),100)}},{key:"drag",value:function(e){this.active&&(e.preventDefault(),"touchmove"===e.type?(this.currentX=e.touches[0].clientX-this.initialX,this.currentY=e.touches[0].clientY-this.initialY):(this.currentX=e.clientX-this.initialX,this.currentY=e.clientY-this.initialY),this.xOffset=this.currentX,this.yOffset=this.currentY,this.img.isDragging=!0,this.dragging=!0,this.setTranslate(this.img,this.currentX,this.currentY))}},{key:"onMove",value:function(e){if(this.zoomedIn){var t=e.clientX-this.img.naturalWidth/2,i=e.clientY-this.img.naturalHeight/2;this.setTranslate(this.img,t,i)}}},{key:"setTranslate",value:function(e,t,i){e.style.transform="translate3d("+t+"px, "+i+"px, 0)"}},{key:"widowWidth",value:function(){return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth}}]),e}(),V=function(){function e(){var i=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,e);var s=n.dragEl,l=n.toleranceX,o=void 0===l?40:l,r=n.toleranceY,a=void 0===r?65:r,h=n.slide,c=void 0===h?null:h,d=n.instance,u=void 0===d?null:d;this.el=s,this.active=!1,this.dragging=!1,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.direction=null,this.lastDirection=null,this.toleranceX=o,this.toleranceY=a,this.toleranceReached=!1,this.dragContainer=this.el,this.slide=c,this.instance=u,this.el.addEventListener("mousedown",(function(e){return i.dragStart(e)}),!1),this.el.addEventListener("mouseup",(function(e){return i.dragEnd(e)}),!1),this.el.addEventListener("mousemove",(function(e){return i.drag(e)}),!1)}return n(e,[{key:"dragStart",value:function(e){if(this.slide.classList.contains("zoomed"))this.active=!1;else{"touchstart"===e.type?(this.initialX=e.touches[0].clientX-this.xOffset,this.initialY=e.touches[0].clientY-this.yOffset):(this.initialX=e.clientX-this.xOffset,this.initialY=e.clientY-this.yOffset);var t=e.target.nodeName.toLowerCase();e.target.classList.contains("nodrag")||v(e.target,".nodrag")||-1!==["input","select","textarea","button","a"].indexOf(t)?this.active=!1:(e.preventDefault(),(e.target===this.el||"img"!==t&&v(e.target,".gslide-inline"))&&(this.active=!0,this.el.classList.add("dragging"),this.dragContainer=v(e.target,".ginner-container")))}}},{key:"dragEnd",value:function(e){var t=this;e&&e.preventDefault(),this.initialX=0,this.initialY=0,this.currentX=null,this.currentY=null,this.initialX=null,this.initialY=null,this.xOffset=0,this.yOffset=0,this.active=!1,this.doSlideChange&&(this.instance.preventOutsideClick=!0,"right"==this.doSlideChange&&this.instance.prevSlide(),"left"==this.doSlideChange&&this.instance.nextSlide()),this.doSlideClose&&this.instance.close(),this.toleranceReached||this.setTranslate(this.dragContainer,0,0,!0),setTimeout((function(){t.instance.preventOutsideClick=!1,t.toleranceReached=!1,t.lastDirection=null,t.dragging=!1,t.el.isDragging=!1,t.el.classList.remove("dragging"),t.slide.classList.remove("dragging-nav"),t.dragContainer.style.transform="",t.dragContainer.style.transition=""}),100)}},{key:"drag",value:function(e){if(this.active){e.preventDefault(),this.slide.classList.add("dragging-nav"),"touchmove"===e.type?(this.currentX=e.touches[0].clientX-this.initialX,this.currentY=e.touches[0].clientY-this.initialY):(this.currentX=e.clientX-this.initialX,this.currentY=e.clientY-this.initialY),this.xOffset=this.currentX,this.yOffset=this.currentY,this.el.isDragging=!0,this.dragging=!0,this.doSlideChange=!1,this.doSlideClose=!1;var t=Math.abs(this.currentX),i=Math.abs(this.currentY);if(t>0&&t>=Math.abs(this.currentY)&&(!this.lastDirection||"x"==this.lastDirection)){this.yOffset=0,this.lastDirection="x",this.setTranslate(this.dragContainer,this.currentX,0);var n=this.shouldChange();if(!this.instance.settings.dragAutoSnap&&n&&(this.doSlideChange=n),this.instance.settings.dragAutoSnap&&n)return this.instance.preventOutsideClick=!0,this.toleranceReached=!0,this.active=!1,this.instance.preventOutsideClick=!0,this.dragEnd(null),"right"==n&&this.instance.prevSlide(),void("left"==n&&this.instance.nextSlide())}if(this.toleranceY>0&&i>0&&i>=t&&(!this.lastDirection||"y"==this.lastDirection)){this.xOffset=0,this.lastDirection="y",this.setTranslate(this.dragContainer,0,this.currentY);var s=this.shouldClose();return!this.instance.settings.dragAutoSnap&&s&&(this.doSlideClose=!0),void(this.instance.settings.dragAutoSnap&&s&&this.instance.close())}}}},{key:"shouldChange",value:function(){var e=!1;if(Math.abs(this.currentX)>=this.toleranceX){var t=this.currentX>0?"right":"left";("left"==t&&this.slide!==this.slide.parentNode.lastChild||"right"==t&&this.slide!==this.slide.parentNode.firstChild)&&(e=t)}return e}},{key:"shouldClose",value:function(){var e=!1;return Math.abs(this.currentY)>=this.toleranceY&&(e=!0),e}},{key:"setTranslate",value:function(e,t,i){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];e.style.transition=n?"all .2s ease":"",e.style.transform="translate3d("+t+"px, "+i+"px, 0)"}}]),e}();function F(e,t,i){var n=e.querySelector(".gslide-media"),s=new Image,l="gSlideTitle_"+t.index,o="gSlideDesc_"+t.index;s.addEventListener("load",(function(){C(i)&&i()}),!1),s.src=t.href,s.alt="",""!==t.title&&s.setAttribute("aria-labelledby",l),""!==t.description&&s.setAttribute("aria-describedby",o),n.insertBefore(s,n.firstChild)}function R(e,t,i){var n=this,s=e.querySelector(".ginner-container"),l="gvideo"+t.index,o=e.querySelector(".gslide-media"),r=this.getAllPlayers();d(s,"gvideo-container"),o.insertBefore(b('<div class="gvideo-wrapper"></div>'),o.firstChild);var a=e.querySelector(".gvideo-wrapper");T(this.settings.plyr.css);var h=t.href,c=location.protocol.replace(":",""),u="",g="",v=!1;"file"==c&&(c="http"),o.style.maxWidth=t.width,T(this.settings.plyr.js,"Plyr",(function(){if(h.match(/vimeo\.com\/([0-9]*)/)){var e=/vimeo.*\/(\d+)/i.exec(h);u="vimeo",g=e[1]}if(h.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/)||h.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)||h.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/)){var s=function(e){var t="";t=void 0!==(e=e.replace(/(>|<)/gi,"").split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/))[2]?(t=e[2].split(/[^0-9a-z_\-]/i))[0]:e;return t}(h);u="youtube",g=s}if(null!==h.match(/\.(mp4|ogg|webm|mov)$/)){u="local";var o='<video id="'+l+'" ';o+='style="background:#000; max-width: '.concat(t.width,';" '),o+='preload="metadata" ',o+='x-webkit-airplay="allow" ',o+='webkit-playsinline="" ',o+="controls ",o+='class="gvideo-local">';var c=h.toLowerCase().split(".").pop(),f={mp4:"",ogg:"",webm:""};for(var p in f[c="mov"==c?"mp4":c]=h,f)if(f.hasOwnProperty(p)){var m=f[p];t.hasOwnProperty(p)&&(m=t[p]),""!==m&&(o+='<source src="'.concat(m,'" type="video/').concat(p,'">'))}v=b(o+="</video>")}var y=v||b('<div id="'.concat(l,'" data-plyr-provider="').concat(u,'" data-plyr-embed-id="').concat(g,'"></div>'));d(a,"".concat(u,"-video gvideo")),a.appendChild(y),a.setAttribute("data-id",l),a.setAttribute("data-index",t.index);var x=I(n.settings.plyr,"config")?n.settings.plyr.config:{},S=new Plyr("#"+l,x);S.on("ready",(function(e){var t=e.detail.plyr;r[l]=t,C(i)&&i()})),S.on("enterfullscreen",G),S.on("exitfullscreen",G)}))}function G(e){var t=v(e.target,".gslide-media");"enterfullscreen"==e.type&&d(t,"fullscreen"),"exitfullscreen"==e.type&&u(t,"fullscreen")}function Z(e,t,i){var n,s=this,l=e.querySelector(".gslide-media"),o=!(!I(t,"href")||!t.href)&&t.href.split("#").pop().trim(),r=!(!I(t,"content")||!t.content)&&t.content;if(r&&(E(r)&&(n=b('<div class="ginlined-content">'.concat(r,"</div>"))),A(r))){"none"==r.style.display&&(r.style.display="block");var a=document.createElement("div");a.className="ginlined-content",a.appendChild(r),n=a}if(o){var h=document.getElementById(o);if(!h)return!1;var u=h.cloneNode(!0);u.style.height=t.height,u.style.maxWidth=t.width,d(u,"ginlined-content"),n=u}if(!n)return console.error("Unable to append inline slide content",t),!1;l.style.height=t.height,l.style.width=t.width,l.appendChild(n),this.events["inlineclose"+o]=c("click",{onElement:l.querySelectorAll(".gtrigger-close"),withCallback:function(e){e.preventDefault(),s.close()}}),C(i)&&i()}function $(e,t,i){var n=e.querySelector(".gslide-media"),s=function(e){var t=e.url,i=e.allow,n=e.callback,s=e.appendTo,l=document.createElement("iframe");return l.className="vimeo-video gvideo",l.src=t,l.style.width="100%",l.style.height="100%",i&&l.setAttribute("allow",i),l.onload=function(){d(l,"node-ready"),C(n)&&n()},s&&s.appendChild(l),l}({url:t.href,callback:i});n.parentNode.style.maxWidth=t.width,n.parentNode.style.height=t.height,n.appendChild(s)}var U=function(){function e(i,n){t(this,e),this.element=i,this.settings=n,this.defaults={href:"",title:"",type:"",description:"",descPosition:"bottom",effect:"",width:"",height:"",node:!1,content:!1,zoomable:!0,draggable:!0}}return n(e,[{key:"sourceType",value:function(e){var t=e;if(null!==(e=e.toLowerCase()).match(/\.(jpeg|jpg|jpe|gif|png|apn|webp|svg)$/))return"image";if(e.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/)||e.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)||e.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/))return"video";if(e.match(/vimeo\.com\/([0-9]*)/))return"video";if(null!==e.match(/\.(mp4|ogg|webm|mov)$/))return"video";if(null!==e.match(/\.(mp3|wav|wma|aac|ogg)$/))return"audio";if(e.indexOf("#")>-1&&""!==t.split("#").pop().trim())return"inline";return e.indexOf("goajax=true")>-1?"ajax":"external"}},{key:"parseConfig",value:function(e,t){var i=this,n=r({descPosition:t.descPosition},this.defaults);if(P(e)&&!A(e)){I(e,"type")||(I(e,"content")&&e.content?e.type="inline":I(e,"href")&&(e.type=this.sourceType(e.href)));var s=r(n,e);return this.setSize(s,t),s}var l="",o=e.getAttribute("data-glightbox"),h=e.nodeName.toLowerCase();if("a"===h&&(l=e.href),"img"===h&&(l=e.src),n.href=l,a(n,(function(s,l){I(t,l)&&"width"!==l&&(n[l]=t[l]);var o=e.dataset[l];M(o)||(n[l]=i.sanitizeValue(o))})),n.content&&(n.type="inline"),!n.type&&l&&(n.type=this.sourceType(l)),M(o)){if("a"==h){var c=e.title;M(c)||""===c||(n.title=c)}if("img"==h){var d=e.alt;M(d)||""===d||(n.title=d)}var u=e.getAttribute("data-description");M(u)||""===u||(n.description=u)}else{var g=[];a(n,(function(e,t){g.push(";\\s?"+t)})),g=g.join("\\s?:|"),""!==o.trim()&&a(n,(function(e,t){var s=o,l=new RegExp("s?"+t+"s?:s?(.*?)("+g+"s?:|$)"),r=s.match(l);if(r&&r.length&&r[1]){var a=r[1].trim().replace(/;\s*$/,"");n[t]=i.sanitizeValue(a)}}))}if(n.description&&"."==n.description.substring(0,1)&&document.querySelector(n.description))n.description=document.querySelector(n.description).innerHTML;else{var v=e.querySelector(".glightbox-desc");v&&(n.description=v.innerHTML)}return this.setSize(n,t),this.slideConfig=n,n}},{key:"setSize",value:function(e,t){var i="video"==e.type?this.checkSize(t.videosWidth):this.checkSize(t.width),n=this.checkSize(t.height);return e.width=I(e,"width")&&""!==e.width?this.checkSize(e.width):i,e.height=I(e,"height")&&""!==e.height?this.checkSize(e.height):n,e}},{key:"checkSize",value:function(e){return z(e)?"".concat(e,"px"):e}},{key:"sanitizeValue",value:function(e){return"true"!==e&&"false"!==e?e:"true"===e}}]),e}(),J=function(){function e(i,n){t(this,e),this.element=i,this.instance=n}return n(e,[{key:"setContent",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(g(t,"loaded"))return!1;var n=this.instance.settings,s=this.slideConfig,l=k();C(n.beforeSlideLoad)&&n.beforeSlideLoad({index:s.index,slide:t,player:!1});var o=s.type,r=s.descPosition,a=t.querySelector(".gslide-media"),h=t.querySelector(".gslide-title"),c=t.querySelector(".gslide-desc"),u=t.querySelector(".gdesc-inner"),v=i,f="gSlideTitle_"+s.index,p="gSlideDesc_"+s.index;if(C(n.afterSlideLoad)&&(v=function(){C(i)&&i(),n.afterSlideLoad({index:s.index,slide:t,player:e.instance.getSlidePlayerInstance(s.index)})}),""==s.title&&""==s.description?u&&u.parentNode.parentNode.removeChild(u.parentNode):(h&&""!==s.title?(h.id=f,h.innerHTML=s.title):h.parentNode.removeChild(h),c&&""!==s.description?(c.id=p,l&&n.moreLength>0?(s.smallDescription=this.slideShortDesc(s.description,n.moreLength,n.moreText),c.innerHTML=s.smallDescription,this.descriptionEvents(c,s)):c.innerHTML=s.description):c.parentNode.removeChild(c),d(a.parentNode,"desc-".concat(r)),d(u.parentNode,"description-".concat(r))),d(a,"gslide-".concat(o)),d(t,"loaded"),"video"!==o){if("external"!==o)return"inline"===o?(Z.apply(this.instance,[t,s,v]),void(s.draggable&&new V({dragEl:t.querySelector(".gslide-inline"),toleranceX:n.dragToleranceX,toleranceY:n.dragToleranceY,slide:t,instance:this.instance}))):void("image"!==o?C(v)&&v():F(t,s,(function(){var i=t.querySelector("img");s.draggable&&new V({dragEl:i,toleranceX:n.dragToleranceX,toleranceY:n.dragToleranceY,slide:t,instance:e.instance}),s.zoomable&&i.naturalWidth>i.offsetWidth&&(d(i,"zoomable"),new j(i,t,(function(){e.instance.resize()}))),C(v)&&v()})));$.apply(this,[t,s,v])}else R.apply(this.instance,[t,s,v])}},{key:"slideShortDesc",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:50,i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=i;if((e=e.trim()).length<=t)return e;var s=e.substr(0,t-1);return n?s+'... <a href="#" class="desc-more">'+i+"</a>":s}},{key:"descriptionEvents",value:function(e,t){var i=this,n=e.querySelector(".desc-more");if(!n)return!1;c("click",{onElement:n,withCallback:function(e,n){e.preventDefault();var s=document.body,l=v(n,".gslide-desc");if(!l)return!1;l.innerHTML=t.description,d(s,"gdesc-open");var o=c("click",{onElement:[s,v(l,".gslide-description")],withCallback:function(e,n){"a"!==e.target.nodeName.toLowerCase()&&(u(s,"gdesc-open"),d(s,"gdesc-closed"),l.innerHTML=t.smallDescription,i.descriptionEvents(l,t),setTimeout((function(){u(s,"gdesc-closed")}),400),o.destroy())}})}})}},{key:"create",value:function(){return b(this.instance.settings.slideHTML)}},{key:"getConfig",value:function(){var e=new U;return this.slideConfig=e.parseConfig(this.element,this.instance.settings),this.slideConfig}}]),e}(),K=k(),Q=null!==k()||void 0!==document.createTouch||"ontouchstart"in window||"onmsgesturechange"in window||navigator.msMaxTouchPoints,ee=document.getElementsByTagName("html")[0],te={selector:".glightbox",elements:null,skin:"clean",closeButton:!0,startAt:null,autoplayVideos:!0,descPosition:"bottom",width:"900px",height:"506px",videosWidth:"960px",beforeSlideChange:null,afterSlideChange:null,beforeSlideLoad:null,afterSlideLoad:null,slideInserted:null,slideRemoved:null,onOpen:null,onClose:null,loop:!1,zoomable:!0,draggable:!0,dragAutoSnap:!1,dragToleranceX:40,dragToleranceY:65,preload:!0,oneSlidePerOpen:!1,touchNavigation:!0,touchFollowAxis:!0,keyboardNavigation:!0,closeOnOutsideClick:!0,plyr:{css:"https://cdn.plyr.io/3.5.6/plyr.css",js:"https://cdn.plyr.io/3.5.6/plyr.js",config:{ratio:"16:9",youtube:{noCookie:!0,rel:0,showinfo:0,iv_load_policy:3},vimeo:{byline:!1,portrait:!1,title:!1,transparent:!1}}},openEffect:"zoom",closeEffect:"zoom",slideEffect:"slide",moreText:"See more",moreLength:60,lightboxHTML:"",cssEfects:{fade:{in:"fadeIn",out:"fadeOut"},zoom:{in:"zoomIn",out:"zoomOut"},slide:{in:"slideInRight",out:"slideOutLeft"},slide_back:{in:"slideInLeft",out:"slideOutRight"},none:{in:"none",out:"none"}},svg:{close:'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><g><path d="M505.943,6.058c-8.077-8.077-21.172-8.077-29.249,0L6.058,476.693c-8.077,8.077-8.077,21.172,0,29.249C10.096,509.982,15.39,512,20.683,512c5.293,0,10.586-2.019,14.625-6.059L505.943,35.306C514.019,27.23,514.019,14.135,505.943,6.058z"/></g></g><g><g><path d="M505.942,476.694L35.306,6.059c-8.076-8.077-21.172-8.077-29.248,0c-8.077,8.076-8.077,21.171,0,29.248l470.636,470.636c4.038,4.039,9.332,6.058,14.625,6.058c5.293,0,10.587-2.019,14.624-6.057C514.018,497.866,514.018,484.771,505.942,476.694z"/></g></g></svg>',next:'<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"> <g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g></svg>',prev:'<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"><g><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"/></g></svg>'},slideHTML:'<div class="gslide">\n    <div class="gslide-inner-content">\n        <div class="ginner-container">\n            <div class="gslide-media">\n            </div>\n            <div class="gslide-description">\n                <div class="gdesc-inner">\n                    <h4 class="gslide-title"></h4>\n                    <div class="gslide-desc"></div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>'};te.lightboxHTML='<div id="glightbox-body" class="glightbox-container">\n    <div class="gloader visible"></div>\n    <div class="goverlay"></div>\n    <div class="gcontainer">\n    <div id="glightbox-slider" class="gslider"></div>\n    <button class="gnext gbtn" tabindex="0" aria-label="Next">{nextSVG}</button>\n    <button class="gprev gbtn" tabindex="1" aria-label="Previous">{prevSVG}</button>\n    <button class="gclose gbtn" tabindex="2" aria-label="Close">{closeSVG}</button>\n</div>\n</div>';var ie=function(){function e(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,e),this.settings=r(te,i),this.effectsClasses=this.getAnimationClasses(),this.videoPlayers={},this.apiEvents=[],this.fullElementsList=!1}return n(e,[{key:"init",value:function(){var e=this,t=this.getSelector();t&&(this.baseEvents=c("click",{onElement:t,withCallback:function(t,i){t.preventDefault(),e.open(i)}})),this.elements=this.getElements()}},{key:"open",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(0==this.elements.length)return!1;this.activeSlide=null,this.prevActiveSlideIndex=null,this.prevActiveSlide=null;var i=z(t)?t:this.settings.startAt;if(A(e)){var n=e.getAttribute("data-gallery");n&&(this.fullElementsList=this.elements,this.elements=this.getGalleryElements(this.elements,n)),M(i)&&(i=this.getElementIndex(e))<0&&(i=0)}z(i)||(i=0),this.build(),f(this.overlay,"none"==this.settings.openEffect?"none":this.settings.cssEfects.fade.in);var s=document.body,l=window.innerWidth-document.documentElement.clientWidth;if(l>0){var o=document.createElement("style");o.type="text/css",o.className="gcss-styles",o.innerText=".gscrollbar-fixer {margin-right: ".concat(l,"px}"),document.head.appendChild(o),d(s,"gscrollbar-fixer")}d(s,"glightbox-open"),d(ee,"glightbox-open"),K&&(d(document.body,"glightbox-mobile"),this.settings.slideEffect="slide"),this.showSlide(i,!0),1==this.elements.length?(y(this.prevButton),y(this.nextButton)):(m(this.prevButton),m(this.nextButton)),this.lightboxOpen=!0,this.trigger("open"),C(this.settings.onOpen)&&this.settings.onOpen(),Q&&this.settings.touchNavigation&&H(this),this.settings.keyboardNavigation&&Y(this)}},{key:"openAt",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this.open(null,e)}},{key:"showSlide",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];m(this.loader),this.index=parseInt(t);var n=this.slidesContainer.querySelector(".current");n&&u(n,"current"),this.slideAnimateOut();var s=this.slidesContainer.querySelectorAll(".gslide")[t];if(g(s,"loaded"))this.slideAnimateIn(s,i),y(this.loader);else{m(this.loader);var l=this.elements[t];this.trigger("slide_before_load",l),l.instance.setContent(s,(function(){y(e.loader),e.resize(),e.slideAnimateIn(s,i),e.trigger("slide_after_load",l)}))}this.slideDescription=s.querySelector(".gslide-description"),this.slideDescriptionContained=this.slideDescription&&g(this.slideDescription.parentNode,"gslide-media"),this.settings.preload&&(this.preloadSlide(t+1),this.preloadSlide(t-1)),this.updateNavigationClasses(),this.activeSlide=s}},{key:"preloadSlide",value:function(e){var t=this;if(e<0||e>this.elements.length-1)return!1;if(M(this.elements[e]))return!1;var i=this.slidesContainer.querySelectorAll(".gslide")[e];if(g(i,"loaded"))return!1;var n=this.elements[e],s=n.type;this.trigger("slide_before_load",n),"video"==s||"external"==s?setTimeout((function(){n.instance.setContent(i,(function(){t.trigger("slide_after_load",n)}))}),200):n.instance.setContent(i,(function(){t.trigger("slide_after_load",n)}))}},{key:"prevSlide",value:function(){this.goToSlide(this.index-1)}},{key:"nextSlide",value:function(){this.goToSlide(this.index+1)}},{key:"goToSlide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(this.prevActiveSlide=this.activeSlide,this.prevActiveSlideIndex=this.index,!this.loop()&&(e<0||e>this.elements.length-1))return!1;e<0?e=this.elements.length-1:e>=this.elements.length&&(e=0),this.showSlide(e)}},{key:"insertSlide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1,i=new J(e,this),n=i.getConfig(),s=i.create(),l=this.elements.length-1;if(t<0&&(t=this.elements.length),n.index=t,n.node=!1,n.instance=i,this.elements.splice(t,0,n),this.slidesContainer){if(t>l)this.slidesContainer.appendChild(s);else{var o=this.slidesContainer.querySelectorAll(".gslide")[t];this.slidesContainer.insertBefore(s,o)}(this.settings.preload&&0==this.index&&0==t||this.index-1==t||this.index+1==t)&&this.preloadSlide(t),0==this.index&&0==t&&(this.index=1),this.updateNavigationClasses()}this.trigger("slide_inserted",{index:t,slide:this.slidesContainer.querySelectorAll(".gslide")[t],player:this.getSlidePlayerInstance(t)}),C(this.settings.slideInserted)&&this.settings.slideInserted({index:t,slide:this.slidesContainer.querySelectorAll(".gslide")[t],player:this.getSlidePlayerInstance(t)})}},{key:"removeSlide",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:-1;if(e<0||e>this.elements.length-1)return!1;var t=this.slidesContainer&&this.slidesContainer.querySelectorAll(".gslide")[e];t&&(this.getActiveSlideIndex()==e&&(e==this.elements.length-1?this.prevSlide():this.nextSlide()),t.parentNode.removeChild(t)),this.elements.splice(e,1),this.trigger("slide_removed",e),C(this.settings.slideRemoved)&&this.settings.slideRemoved(e)}},{key:"slideAnimateIn",value:function(e,t){var i=this,n=e.querySelector(".gslide-media"),s=e.querySelector(".gslide-description"),l={index:this.prevActiveSlideIndex,slide:this.prevActiveSlide,player:this.getSlidePlayerInstance(this.prevActiveSlideIndex)},o={index:this.index,slide:this.activeSlide,player:this.getSlidePlayerInstance(this.index)};if(n.offsetWidth>0&&s&&(y(s),s.style.display=""),u(e,this.effectsClasses),t)f(e,this.settings.cssEfects[this.settings.openEffect].in,(function(){!K&&i.settings.autoplayVideos&&i.slidePlayerPlay(e),i.trigger("slide_changed",{prev:l,current:o}),C(i.settings.afterSlideChange)&&i.settings.afterSlideChange.apply(i,[l,o])}));else{var r=this.settings.slideEffect,a="none"!==r?this.settings.cssEfects[r].in:r;this.prevActiveSlideIndex>this.index&&"slide"==this.settings.slideEffect&&(a=this.settings.cssEfects.slide_back.in),f(e,a,(function(){!K&&i.settings.autoplayVideos&&i.slidePlayerPlay(e),i.trigger("slide_changed",{prev:l,current:o}),C(i.settings.afterSlideChange)&&i.settings.afterSlideChange.apply(i,[l,o])}))}setTimeout((function(){i.resize(e)}),100),d(e,"current")}},{key:"slideAnimateOut",value:function(){if(!this.prevActiveSlide)return!1;var e=this.prevActiveSlide;u(e,this.effectsClasses),d(e,"prev");var t=this.settings.slideEffect,i="none"!==t?this.settings.cssEfects[t].out:t;this.slidePlayerPause(e),this.trigger("slide_before_change",{prev:{index:this.prevActiveSlideIndex,slide:this.prevActiveSlide,player:this.getSlidePlayerInstance(this.prevActiveSlideIndex)},current:{index:this.index,slide:this.activeSlide,player:this.getSlidePlayerInstance(this.index)}}),C(this.settings.beforeSlideChange)&&this.settings.beforeSlideChange.apply(this,[{index:this.prevActiveSlideIndex,slide:this.prevActiveSlide,player:this.getSlidePlayerInstance(this.prevActiveSlideIndex)},{index:this.index,slide:this.activeSlide,player:this.getSlidePlayerInstance(this.index)}]),this.prevActiveSlideIndex>this.index&&"slide"==this.settings.slideEffect&&(i=this.settings.cssEfects.slide_back.out),f(e,i,(function(){var t=e.querySelector(".gslide-media"),i=e.querySelector(".gslide-description");t.style.transform="",u(t,"greset"),t.style.opacity="",i&&(i.style.opacity=""),u(e,"prev")}))}},{key:"getAllPlayers",value:function(){return this.videoPlayers}},{key:"getSlidePlayerInstance",value:function(e){var t="gvideo"+e,i=this.getAllPlayers();return!(!I(i,t)||!i[t])&&i[t]}},{key:"stopSlideVideo",value:function(e){if(A(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}console.log("stopSlideVideo is deprecated, use slidePlayerPause");var i=this.getSlidePlayerInstance(e);i&&i.playing&&i.pause()}},{key:"slidePlayerPause",value:function(e){if(A(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}var i=this.getSlidePlayerInstance(e);i&&i.playing&&i.pause()}},{key:"playSlideVideo",value:function(e){if(A(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}console.log("playSlideVideo is deprecated, use slidePlayerPlay");var i=this.getSlidePlayerInstance(e);i&&!i.playing&&i.play()}},{key:"slidePlayerPlay",value:function(e){if(A(e)){var t=e.querySelector(".gvideo-wrapper");t&&(e=t.getAttribute("data-index"))}var i=this.getSlidePlayerInstance(e);i&&!i.playing&&i.play()}},{key:"setElements",value:function(e){var t=this;this.settings.elements=!1;var i=[];e&&e.length&&a(e,(function(e,n){var s=new J(e,t),l=s.getConfig();l.instance=s,l.index=n,i.push(l)})),this.elements=i,this.lightboxOpen&&(this.slidesContainer.innerHTML="",this.elements.length&&(a(this.elements,(function(){var e=b(t.settings.slideHTML);t.slidesContainer.appendChild(e)})),this.showSlide(0,!0)))}},{key:"getElementIndex",value:function(e){var t=!1;return a(this.elements,(function(i,n){if(I(i,"node")&&i.node==e)return t=n,!0})),t}},{key:"getElements",value:function(){var e=this,t=[];this.elements=this.elements?this.elements:[],!M(this.settings.elements)&&L(this.settings.elements)&&this.settings.elements.length&&a(this.settings.elements,(function(i,n){var s=new J(i,e),l=s.getConfig();l.node=!1,l.index=n,l.instance=s,t.push(l)}));var i=!1;return this.getSelector()&&(i=document.querySelectorAll(this.getSelector())),i?(a(i,(function(i,n){var s=new J(i,e),l=s.getConfig();l.node=i,l.index=n,l.instance=s,l.gallery=i.getAttribute("data-gallery"),t.push(l)})),t):t}},{key:"getGalleryElements",value:function(e,t){return e.filter((function(e){return e.gallery==t}))}},{key:"getSelector",value:function(){return!this.settings.elements&&(this.settings.selector&&"data-"==this.settings.selector.substring(0,5)?"*[".concat(this.settings.selector,"]"):this.settings.selector)}},{key:"getActiveSlide",value:function(){return this.slidesContainer.querySelectorAll(".gslide")[this.index]}},{key:"getActiveSlideIndex",value:function(){return this.index}},{key:"getAnimationClasses",value:function(){var e=[];for(var t in this.settings.cssEfects)if(this.settings.cssEfects.hasOwnProperty(t)){var i=this.settings.cssEfects[t];e.push("g".concat(i.in)),e.push("g".concat(i.out))}return e.join(" ")}},{key:"build",value:function(){var e=this;if(this.built)return!1;var t=I(this.settings.svg,"next")?this.settings.svg.next:"",i=I(this.settings.svg,"prev")?this.settings.svg.prev:"",n=I(this.settings.svg,"close")?this.settings.svg.close:"",s=this.settings.lightboxHTML;s=b(s=(s=(s=s.replace(/{nextSVG}/g,t)).replace(/{prevSVG}/g,i)).replace(/{closeSVG}/g,n)),document.body.appendChild(s);var l=document.getElementById("glightbox-body");this.modal=l;var o=l.querySelector(".gclose");this.prevButton=l.querySelector(".gprev"),this.nextButton=l.querySelector(".gnext"),this.overlay=l.querySelector(".goverlay"),this.loader=l.querySelector(".gloader"),this.slidesContainer=document.getElementById("glightbox-slider"),this.events={},d(this.modal,"glightbox-"+this.settings.skin),this.settings.closeButton&&o&&(this.events.close=c("click",{onElement:o,withCallback:function(t,i){t.preventDefault(),e.close()}})),o&&!this.settings.closeButton&&o.parentNode.removeChild(o),this.nextButton&&(this.events.next=c("click",{onElement:this.nextButton,withCallback:function(t,i){t.preventDefault(),e.nextSlide()}})),this.prevButton&&(this.events.prev=c("click",{onElement:this.prevButton,withCallback:function(t,i){t.preventDefault(),e.prevSlide()}})),this.settings.closeOnOutsideClick&&(this.events.outClose=c("click",{onElement:l,withCallback:function(t,i){e.preventOutsideClick||g(document.body,"glightbox-mobile")||v(t.target,".ginner-container")||v(t.target,".gbtn")||g(t.target,"gnext")||g(t.target,"gprev")||e.close()}})),a(this.elements,(function(t){e.slidesContainer.appendChild(t.instance.create())})),Q&&d(document.body,"glightbox-touch"),this.events.resize=c("resize",{onElement:window,withCallback:function(){e.resize()}}),this.built=!0}},{key:"resize",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;if((e=e||this.activeSlide)&&!g(e,"zoomed")){var t=x(),i=e.querySelector(".gvideo-wrapper"),n=e.querySelector(".gslide-image"),s=this.slideDescription,l=t.width,o=t.height;if(l<=768?d(document.body,"glightbox-mobile"):u(document.body,"glightbox-mobile"),i||n){var r=!1;if(s&&(g(s,"description-bottom")||g(s,"description-top"))&&!g(s,"gabsolute")&&(r=!0),n)if(l<=768){var a=n.querySelector("img");a.setAttribute("style","")}else if(r){var h=s.offsetHeight,c=n.querySelector("img");c.setAttribute("style","max-height: calc(100vh - ".concat(h,"px)")),s.setAttribute("style","max-width: ".concat(c.offsetWidth,"px;"))}if(i){var v=I(this.settings.plyr.config,"ratio")?this.settings.plyr.config.ratio:"16:9",f=v.split(":"),p=900,m=p/(parseInt(f[0])/parseInt(f[1]));if(m=Math.floor(m),r&&(o-=s.offsetHeight),o<m&&l>p){var y=i.offsetWidth,b=i.offsetHeight,S=o/b,w={width:y*S,height:b*S};i.parentNode.setAttribute("style","max-width: ".concat(w.width,"px")),r&&s.setAttribute("style","max-width: ".concat(w.width,"px;"))}else i.parentNode.style.maxWidth="".concat(p,"px"),r&&s.setAttribute("style","max-width: ".concat(p,"px;"))}}}}},{key:"reload",value:function(){this.init()}},{key:"updateNavigationClasses",value:function(){var e=this.loop();u(this.nextButton,"disabled"),u(this.prevButton,"disabled"),0==this.index&&this.elements.length-1==0?(d(this.prevButton,"disabled"),d(this.nextButton,"disabled")):0!==this.index||e?this.index!==this.elements.length-1||e||d(this.nextButton,"disabled"):d(this.prevButton,"disabled")}},{key:"loop",value:function(){var e=I(this.settings,"loopAtEnd")?this.settings.loopAtEnd:null;return e=I(this.settings,"loop")?this.settings.loop:e,e}},{key:"close",value:function(){var e=this;if(!this.lightboxOpen){if(this.events){for(var t in this.events)this.events.hasOwnProperty(t)&&this.events[t].destroy();this.events=null}return!1}if(this.closing)return!1;this.closing=!0,this.slidePlayerPause(this.activeSlide),this.fullElementsList&&(this.elements=this.fullElementsList),d(this.modal,"glightbox-closing"),f(this.overlay,"none"==this.settings.openEffect?"none":this.settings.cssEfects.fade.out),f(this.activeSlide,this.settings.cssEfects[this.settings.closeEffect].out,(function(){if(e.activeSlide=null,e.prevActiveSlideIndex=null,e.prevActiveSlide=null,e.built=!1,e.events){for(var t in e.events)e.events.hasOwnProperty(t)&&e.events[t].destroy();e.events=null}var i=document.body;u(ee,"glightbox-open"),u(i,"glightbox-open touching gdesc-open glightbox-touch glightbox-mobile gscrollbar-fixer"),e.modal.parentNode.removeChild(e.modal),e.trigger("close"),C(e.settings.onClose)&&e.settings.onClose();var n=document.querySelector(".gcss-styles");n&&n.parentNode.removeChild(n),e.lightboxOpen=!1,e.closing=null}))}},{key:"destroy",value:function(){this.close(),this.clearAllEvents(),this.baseEvents.destroy()}},{key:"on",value:function(e,t){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!e||!C(t))throw new TypeError("Event name and callback must be defined");this.apiEvents.push({evt:e,once:i,callback:t})}},{key:"once",value:function(e,t){this.on(e,t,!0)}},{key:"trigger",value:function(e){var t=this,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=[];a(this.apiEvents,(function(t,s){var l=t.evt,o=t.once,r=t.callback;l==e&&(r(i),o&&n.push(s))})),n.length&&a(n,(function(e){return t.apiEvents.splice(e,1)}))}},{key:"clearAllEvents",value:function(){this.apiEvents.push({evt:evt,once:once,callback:callback})}},{key:"version",value:function(){return"3.0.5"}}]),e}();return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=new ie(e);return t.init(),t}}));


 /****************************************************************************************************************************************/
 /*  Vanilla Scripting
 /****************************************************************************************************************************************/


 /*******************************************************/
 /*  Set responsive body class
 /*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	function get_current_state() {
		var state = window.getComputedStyle(document.body,':before').getPropertyValue('content');
		return state.replace( /["']/g,''); // Firefox / Chrome 43 bugfix
	}

	function setBreakPointBodyClass(size) {

		var body_tag = document.getElementsByTagName('body')[0];

		body_tag.classList.remove('ecp-breakpoint-small');
		body_tag.classList.remove('ecp-breakpoint-medium');
		body_tag.classList.remove('ecp-breakpoint-large');
		body_tag.classList.add('ecp-breakpoint-' + size);
	}

	setBreakPointBodyClass(get_current_state());

	window.addEventListener('resize', function(event){
		setBreakPointBodyClass(get_current_state())
	});


	var html_tag = document.getElementsByTagName('html')[0];

	if (html_tag.classList.contains('fl-builder-edit')) {
		FLBuilder.addHook( 'responsive-editing-switched', function( e, mode ) {

			if (mode == 'default') setBreakPointBodyClass('large');
			if (mode == 'medium') setBreakPointBodyClass('medium');
			if (mode == 'responsive') setBreakPointBodyClass('small');

		} );
	}

});


/*******************************************************/
/*  Find all anchor tag with href="tel:"
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	[...document.querySelectorAll('a[href^="tel:"]')].forEach(function(el) {
		el.classList.add('ecp-phone-call-phone');
	});

});


/*******************************************************/
/*  Carousels: Slideshows
/*******************************************************/

function initSplideSlideshow(slideshow) {
	new Splide(slideshow).mount();
}

function loadSplideSlideshows() {
	var splideSlideshows = document.querySelectorAll('.ecp-slideshow.splide:not(.is-active)');
	splideSlideshows.forEach(function(slideshow) {
		initSplideSlideshow(slideshow);


		var slides = slideshow.querySelectorAll('.ecp-slide');
		if (slides) {
			slides.forEach(item => {
				item.addEventListener('click', event => {
					event.preventDefault();
					var link = item.getAttribute('data-slide-url');
					var url_target = item.getAttribute('data-slide-url_target');
					if (link) {window.open(link, url_target);}
				});
			});
		}


	});
}

document.addEventListener( 'DOMContentLoaded', function () {
	loadSplideSlideshows();
});

if (window.jQuery) {
	jQuery(document).ready(function($) {
		$(document).ajaxSuccess(function() {
			loadSplideSlideshows();
		});
	});
}


/*******************************************************/
/*  Carousels: Images
/*******************************************************/

function initSplideCarousel(carousel) {
	new Splide(carousel).mount();
}

function loadSplideCarousels() {
	var splideCarousels = document.querySelectorAll('.ecp-carousel.splide:not(.is-active)');
	splideCarousels.forEach(function(carousel) {
		initSplideCarousel(carousel);
	});
}

document.addEventListener( 'DOMContentLoaded', function () {
	loadSplideCarousels();
});

if (window.jQuery) {
	jQuery(document).ready(function($) {
		$(document).ajaxSuccess(function() {
			loadSplideCarousels();
		});
	});
}


/*******************************************************/
/*  Carousels: Posts
/*******************************************************/

function initSplidePostCarousel(postCarousel) {
	let splide = new Splide(postCarousel, {slideFocus: false}).mount();

	splide.root.querySelectorAll('a').forEach(function(el) {
	  el.removeAttribute('tabindex');
	});
	splide.root.querySelectorAll('.splide__slide--clone a').forEach(function(el) {
	  el.setAttribute('tabindex', -1);
	});

	splide.on( 'moved', function () {
		splide.root.querySelectorAll('a').forEach(function(el) {
		  el.removeAttribute('tabindex');
		});
		splide.root.querySelectorAll('.splide__slide--clone a').forEach(function(el) {
		  el.setAttribute('tabindex', -1);
		});
	} );
}

function loadSplidePostCarousels() {
	var splidePostCarousels = document.querySelectorAll('.ecp-posts-wrapper.ecp-view-carousel.splide:not(.is-active)');
	splidePostCarousels.forEach(function(postCarousel) {
		initSplidePostCarousel(postCarousel);
	});
}

document.addEventListener( 'DOMContentLoaded', function () {
	loadSplidePostCarousels();
});

if (window.jQuery) {
	jQuery(document).ready(function($) {
		$(document).ajaxSuccess(function() {
			loadSplidePostCarousels();
		});
	});
}

/*******************************************************/
/*  Flex Sticky Header
/*******************************************************/

document.addEventListener('DOMContentLoaded', function() {

	let body_tag = document.querySelector('body');
	let html_tag = document.getElementsByTagName('html')[0];

	if (! html_tag.classList.contains('fl-builder-edit') && body_tag.classList.contains('ecp-theme-flex')) {

		let header_wrapper = document.querySelector('.ecp-header-wrapper');

		if (! header_wrapper) return;

		let header_class_triggers = ['ecp-header-mode-sticky', 'ecp-header-mode-inline-sticky', 'ecp-header-mode-overlap-sticky'];

		if (header_class_triggers.some(className => header_wrapper.classList.contains(className))) {

			let adminbar = document.querySelector('#wpadminbar');
			let pagebuilder_adminbar = document.querySelector('.fl-builder-bar');
			let header_wrapper = document.querySelector('.ecp-header-wrapper');
			let header = document.querySelector('.ecp-header-wrapper .ecp-header > div:not([style="display:none"])');
			let header_height = header.offsetHeight;
			let sticky_placeholder = document.querySelector('.ecp-sticky-placeholder');

			let adminbar_height = 0;
			let pagebuilder_adminbar_height = 0;

			if (adminbar) {
				adminbar_height = adminbar.offsetHeight;
			}

			if (pagebuilder_adminbar) {
				pagebuilder_adminbar_height = pagebuilder_adminbar.offsetHeight;
			}

			let adminbars_height = adminbar_height + pagebuilder_adminbar_height;

			if (! sticky_placeholder && header_wrapper.classList.contains('ecp-header-mode-inline-sticky') ) {

				sticky_placeholder = document.createElement('div');
				sticky_placeholder.className = 'ecp-sticky-placeholder';
				sticky_placeholder.style.height = header_height+'px';
				body_tag.insertBefore(sticky_placeholder, document.body.firstChild);

			}

			window.addEventListener('scroll', function() {

				if (document.scrollingElement.scrollTop >= (header_height)) {

					header_wrapper.classList.remove('ecp-header-sticky-disabled');
					header_wrapper.classList.add('ecp-header-sticky-enabled');
					if (header_wrapper.classList.contains('ecp-header-mode-inline-sticky')) sticky_placeholder.style.display = 'block';
					header_wrapper.style.top = adminbars_height;

				} else {

					header_wrapper.classList.add('ecp-header-sticky-disabled');
					header_wrapper.classList.remove('ecp-header-sticky-enabled');
					if (header_wrapper.classList.contains('ecp-header-mode-inline-sticky')) sticky_placeholder.style.display = 'none';
					header_wrapper.style.top = '';

				}
			}, {passive: true});


		}
	}

});


/*******************************************************/
/*  Click to load videos
/*******************************************************/

var click_to_video = document.querySelectorAll('.ecp-video-click-to-activate');

for (var i = 0; i < click_to_video.length; i++) {

	click_to_video[i].addEventListener('click', function(event) {

		event.preventDefault();

		this.classList.remove('ecp-video-click-to-activate');
		var play_button = this.querySelector('.ecp-video-button-play')
		play_button.parentNode.removeChild(play_button);

		var wrap = this.querySelector('.ecp-video-wrap');
		var video_provider = wrap.getAttribute('data-video-provider');
		var video_src = wrap.getAttribute('data-video-src');

		var iframe = document.createElement('iframe');
		iframe.src = video_src;
		iframe.setAttribute('width', '100%');
		iframe.setAttribute('allow', 'autoplay; encrypted-media');
		iframe.setAttribute('frameborder', '0');

		var inner = this.querySelector('.ecp-video-wrap-inner');
		inner.appendChild(iframe);

	});

}


/*******************************************************/
/*  Lazy Load Maps
/*******************************************************/

document.addEventListener('DOMContentLoaded', function() {

	var lazyMaps = [].slice.call(document.querySelectorAll('iframe.ecp-lazyload'));

	if ('IntersectionObserver' in window) {

		let lazyMapObserver = new IntersectionObserver(function(images, observer) {
			images.forEach(function(image) {

				if (image.isIntersecting) {

					let lazyMap = image.target;

					initMap(lazyMap);

					lazyMapObserver.unobserve(lazyMap);

				}
			});
		});

		lazyMaps.forEach(function(lazyMap) {
			lazyMapObserver.observe(lazyMap);
		});

	}

});

function initMap(map) {

	if (! map) return;
	var src = map.getAttribute('data-src');
	map.setAttribute('src', src);

}


/*******************************************************/
/*  Lazy Load Background Rows
/*******************************************************/

document.addEventListener('DOMContentLoaded', function() {

	var lazyRowBackgrounds = [].slice.call(document.querySelectorAll('.fl-row[data-background-image-src]'));

	if ('IntersectionObserver' in window) {
		let lazyRowBackgroundObserver = new IntersectionObserver(function(rows, observer) {
			rows.forEach(function(row) {
				if (row.isIntersecting) {
					let lazyRowBackground = row.target;
					initLazyRowBackground(lazyRowBackground);
					lazyRowBackgroundObserver.unobserve(lazyRowBackground);
				}
			});
		});
		lazyRowBackgrounds.forEach(function(lazyRowBackground) {
			lazyRowBackgroundObserver.observe(lazyRowBackground);
		});

	}

});

function initLazyRowBackground(row) {
	var background_image_src = row.getAttribute('data-background-image-src');
	var row_content = row.querySelector('.fl-row-content-wrap');
	row_content.style.backgroundImage = 'url("'+background_image_src+'")';
}

/*******************************************************/
/*  Lazy Load Background Columns
/*******************************************************/

document.addEventListener('DOMContentLoaded', function() {

	var lazyColumnBackgrounds = [].slice.call(document.querySelectorAll('.fl-col[data-background-image-src]'));

	if ('IntersectionObserver' in window) {
		let lazyColumnBackgroundObserver = new IntersectionObserver(function(columns, observer) {
			columns.forEach(function(column) {
				if (column.isIntersecting) {
					let lazyColumnBackground = column.target;
					initLazyColumnBackground(lazyColumnBackground);
					lazyColumnBackgroundObserver.unobserve(lazyColumnBackground);
				}
			});
		});
		lazyColumnBackgrounds.forEach(function(lazyColumnBackground) {
			lazyColumnBackgroundObserver.observe(lazyColumnBackground);
		});

	}

});

function initLazyColumnBackground(column) {
	var background_image_src = column.getAttribute('data-background-image-src');
	var column_content = column.querySelector('.fl-col-content');
	column_content.style.backgroundImage = 'url("'+background_image_src+'")';
}


/*******************************************************/
/*  WOW animate.css screen delay
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	new WOW().init();

});


/*******************************************************/
/*  Text Resizer + Cookie
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var resize_tool = document.querySelector('.ecp-textsize');

	if ( typeof(resize_tool) != 'undefined' && resize_tool != null) {

		function getCookie(name) {
			var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
			return v ? v[2] : null;
		}
		function setCookie(name, value, days) {
			var d = new Date;
			d.setTime(d.getTime() + 24*60*60*1000*days);
			document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
		}

		var html_tag = document.getElementsByTagName('html')[0];
		var original_font_size = window.getComputedStyle(html_tag).fontSize;
		var size = getCookie('textsize');

		if (size) {
			html_tag.style.fontSize = size + (size.indexOf("px")!=-1 ? "" : "px")
		} else {
			setCookie('textsize', original_font_size);
		}

		document.querySelector('.ecp-textsize-reset').addEventListener('click', function(event) {
			event.preventDefault()
			html_tag.style.fontSize = original_font_size;
			setCookie('textsize', original_font_size);
		});

		document.querySelector('.ecp-textsize-increase').addEventListener('click', function(event) {
			event.preventDefault()
			var current_font_size = window.getComputedStyle(html_tag).fontSize;
			var current_font_size_numeric = parseFloat(current_font_size, 10);
			var new_font_size = current_font_size_numeric*1.1+'px';
			html_tag.style.fontSize = new_font_size;
			setCookie('textsize', new_font_size);
		});

		document.querySelector('.ecp-textsize-decrease').addEventListener('click', function(event) {
			event.preventDefault()
			var current_font_size = window.getComputedStyle(html_tag).fontSize;
			var current_font_size_numeric = parseFloat(current_font_size, 10);
			var new_font_size = current_font_size_numeric*0.9+'px';
			html_tag.style.fontSize = new_font_size;
			setCookie('textsize', new_font_size);
		});


	}

});


/*******************************************************/
/*  Text Resizer Alt + Cookie
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var resize_tool = document.querySelector('.ecp-textsizealt');

	if ( typeof(resize_tool) != 'undefined' && resize_tool != null) {

		function getCookie(name) {
			var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
			return v ? v[2] : null;
		}
		function setCookie(name, value, days) {
			var d = new Date;
			d.setTime(d.getTime() + 24*60*60*1000*days);
			document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
		}

		var body_tag = document.getElementsByTagName('body')[0];
		var size = getCookie('textsizealt');

		if (size) {
			body_tag.classList.add('ecp-textsize-'+size);
		}

		document.querySelector('.ecp-textsizealt .ecp-textsizealt-button-normal').addEventListener('click', function(event) {
			event.preventDefault()
			setCookie('textsizealt', 'normal');
			body_tag.classList.add('ecp-textsize-normal');
			body_tag.classList.remove('ecp-textsize-large');
			body_tag.classList.remove('ecp-textsize-extralarge');
		});

		document.querySelector('.ecp-textsizealt .ecp-textsizealt-button-large').addEventListener('click', function(event) {
			event.preventDefault()
			setCookie('textsizealt', 'large');
			body_tag.classList.add('ecp-textsize-large');
			body_tag.classList.remove('ecp-textsize-normal');
			body_tag.classList.remove('ecp-textsize-extralarge');
		});

		document.querySelector('.ecp-textsizealt .ecp-textsizealt-button-extralarge').addEventListener('click', function(event) {
			event.preventDefault()
			setCookie('textsizealt', 'extralarge');
			body_tag.classList.add('ecp-textsize-extralarge');
			body_tag.classList.remove('ecp-textsize-normal');
			body_tag.classList.remove('ecp-textsize-large');
		});

	}

});


/*******************************************************/
/*  Counters
/*******************************************************/

var isInViewport = function (elem) {
	var bounding = elem.getBoundingClientRect();
	return (
		bounding.top >= 0 &&
		bounding.left >= 0 &&
		bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
};

var counters = function() {

	var counters;
	var windowHeight;
	function init() {
		counters = document.querySelectorAll('.ecp-counter .ecp-counter-number');
		windowHeight = window.innerHeight;
		addEventHandlers();
		checkPosition();
	}
	function addEventHandlers() {
		window.addEventListener('scroll', checkPosition);
		window.addEventListener('resize', init);
	}
	function checkPosition() {
		for (var i = 0; i < counters.length; i++) {

			if (isInViewport(counters[i])) {

				if (! counters[i].parentNode.classList.contains('active')) {

					counters[i].parentNode.classList.add('active');
					var number_start = counters[i].parentNode.getAttribute('data-counter-start');
					var number_end = counters[i].parentNode.getAttribute('data-counter-end');
					var numAnim = new CountUp(counters[i], number_start, number_end);
					if (!numAnim.error) {
						numAnim.start();
					}
				}

			}
		}
	}
	return {
		init: init
	};
};

counters().init();

document.addEventListener("DOMContentLoaded", function(event){

	setTimeout(function() {
		counters().init();
	}, 500);
	
});


/*******************************************************/
/*  Post content accordions
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var accordion_triggers = document.querySelectorAll('.ecp-post-accordion');

	if ( accordion_triggers) {

		accordion_triggers.forEach(item => {

			item.addEventListener('click', event => {
				event.preventDefault();
				event.target.closest('.ecp-post').classList.toggle('ecp-post-accordion-active');
			});

		});

	}

});


/*******************************************************/
/*  Auto add captions to galleries that have autocaption='yes'
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var autocaption_images = document.querySelectorAll('.ecp-gallery-autocaption img');

	if ( autocaption_images) {

		autocaption_images.forEach(item => {

			var caption = item.getAttribute('alt');
			var div_caption = document.createElement('div');
			div_caption.classList.add('ecp-gallery-item-caption');
			div_caption.innerHTML = caption;

			item.parentNode.insertBefore(div_caption, item.nextElementSibling);

		});

	}

});


/*******************************************************/
/*  Tabs
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var tab_groups = document.querySelectorAll('.ecp-tabs');

	if (tab_groups) {

		var hash=window.location.hash.replace('#','');

		tab_groups.forEach(tab_group => {


			if (hash && tab_group.querySelector('.ecp-tabs-content#'+hash)) {
				tab_group.querySelector('.ecp-tabs-control a[href="#'+hash+'"]').closest('li').classList.add('ecp-tab-active');
				tab_group.querySelector('.ecp-tabs-content').style.display = 'none';
				tab_group.querySelector('.ecp-tabs-content#'+hash).classList.add('ecp-tab-active');
				tab_group.querySelector('.ecp-tabs-content#'+hash).style.display = 'block';
			} else {
				tab_group.querySelector('.ecp-tabs-control li:first-child').classList.add('ecp-tab-active');
				tab_group.querySelector('.ecp-tabs-content:first-child').classList.add('ecp-tab-active');
				tab_group.querySelector('.ecp-tabs-content:first-child').style.display = 'block';
			}

			var tab_control_items = tab_group.querySelectorAll('.ecp-tabs-control a');


			tab_control_items.forEach(tab_control_item => {

				tab_control_item.addEventListener('click', function(event) {

					event.preventDefault()

					var tab_name = tab_control_item.getAttribute('href').split('#');
					tab_name = tab_name[(tab_name.length-1)];

					var this_li = tab_control_item.closest('li');
					if (this_li.classList.contains('ecp-tab-active')) return false;

					tab_group.querySelector('.ecp-tabs-control li.ecp-tab-active').classList.remove('ecp-tab-active');
					this_li.classList.add('ecp-tab-active');

					tab_group.querySelector('.ecp-tabs-content.ecp-tab-active').style.display = 'none';
					tab_group.querySelector('.ecp-tabs-content.ecp-tab-active').classList.remove('ecp-tab-active');

					var active_tab_content = tab_group.querySelector('.ecp-tabs-content-wrapper .ecp-tabs-content#'+tab_name);
					active_tab_content.classList.add('ecp-tab-active');
					active_tab_content.style.display = 'block';

				});

			});

		});

	}

});


/*******************************************************/
/*  Voice Search
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var voice_search_button = document.querySelector('.ecp-voice-search-button');

	if ( typeof(voice_search_button) != 'undefined' && voice_search_button != null) {

		voice_search_button.addEventListener('click', function(event) {

			event.preventDefault();

			if (window.hasOwnProperty('webkitSpeechRecognition')) {
				var recognition = new webkitSpeechRecognition();
				recognition.continuous = false;
				recognition.interimResults = false;
				recognition.lang = "en-US";
				recognition.start();
				recognition.onresult = function(e) {
					document.getElementById('transcript').value = e.results[0][0].transcript;
					recognition.stop();
					document.getElementById('voice_search').submit();
				};
				recognition.onerror = function(e) {
					recognition.stop();
				}
			}

		});

	}

});


/*******************************************************/
/*  Parallax
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var ecp_parallax = document.querySelector('.ecp-parallax');

	if ( typeof(ecp_parallax) != 'undefined' && ecp_parallax != null) {

		var speed = -4;

		window.addEventListener('scroll', function(event) {
			var yOffset = window.pageYOffset;
			ecp_parallax.style.backgroundPosition = '0px '+ (yOffset / speed) + "px";
			ecp_parallax.querySelector('.ecp-slide').style.backgroundPosition = '0px '+ (yOffset / speed) + "px";
		})

	};

});


/*******************************************************/
/*  Fixed Header (Used by Big Bang)
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var header = document.querySelector('.ecp-header-autofixed');

	if ( typeof(header) != 'undefined' && header != null) {

		var header_placeholder = document.createElement('div');
		header_placeholder.className = 'ecp-header-autofixed-placeholder';
		header.parentNode.insertBefore(header_placeholder, header);

		var header_height = header.offsetHeight;
		header_placeholder.style.height = header_height;

		function setFixedHeader() {
			var scroll_distance  = window.pageYOffset || document.documentElement.scrollTop
			if (scroll_distance > header_height) {
				header.classList.add('ecp-header-autofixed-active');
			} else {
				header.classList.remove('ecp-header-autofixed-active');
			}
		}

		setFixedHeader();

		window.addEventListener('scroll', function(event) {
			setFixedHeader();
		})
		window.addEventListener('resize', function(event){
			setFixedHeader()
		});

	};

});


/*******************************************************/
/*  General link script
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var click_elements = document.querySelectorAll('[data-href]');

	click_elements.forEach(item => {

		item.addEventListener('click', event => {

			event.preventDefault();

			var link = item.getAttribute('data-href');
			var target = item.getAttribute('data-target');

			if (link) {window.open(link, target);}

		});

	});

});


/*******************************************************/
/*  Links on Photo Grid
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var photogrid_click_elements = document.querySelectorAll('.ecp-photogrid .ecp-photogrid-item');

	photogrid_click_elements.forEach(item => {

		item.addEventListener('click', event => {

			event.preventDefault();

			console.log('click');

			var link = item.getAttribute('data-photogriditem-url');
			var url_target = item.getAttribute('data-photogriditem-url_target');
			if (link) {window.open(link, url_target);}

		});

	});

});


/*******************************************************/
/*  Flip Box Links
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var flipbox_links = document.querySelectorAll('.ecp-flipbox');

	flipbox_links.forEach(box => {
		box.addEventListener('click', e => {

			if (e.target.closest('a')) return;

			e.preventDefault();

			const link = box.getAttribute('data-link');
			const target = box.getAttribute('data-link-target') || '_self';
			if (link) window.open(link, target);
		});
	});

});


/*******************************************************/
/*  Toggle Triggers
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var toggle_elements = document.querySelectorAll('.ecp-toggle-trigger');

	toggle_elements.forEach(item => {

		item.addEventListener('click', event => {
			event.preventDefault();
			item.classList.add('ecp-toggle-trigger');
		});

	});


});

/*******************************************************/
/*  Toggle Triggers
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var toggle_elements = document.querySelectorAll('a[target="toggle"]');

	toggle_elements.forEach(item => {

		item.addEventListener('click', event => {

			event.preventDefault();

			item.classList.toggle('ecp-toggle-trigger-active');
			var target_href = item.getAttribute('href');

			var target = document.querySelector(target_href);

			if (target.style.display === 'none') {
				target.style.display = 'block';
			} else {
				target.style.display = 'none';
			}

		});

	});

});


/*******************************************************/
/*  Accordion
/*******************************************************/

document.addEventListener('DOMContentLoaded', function () {
	var toggle_elements = document.querySelectorAll('.ecp-accordion-trigger');

	toggle_elements.forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();

			const accordion = item.closest('.ecp-accordion');
			const autoCollapse = accordion && accordion.classList.contains('ecp-accordion-auto-collapse-others');

			const isActive = item.classList.contains('active');

			if (isActive) {
				item.classList.remove('active');
				item.nextElementSibling.classList.remove('active');
				item.nextElementSibling.setAttribute('hidden', 'true');
				item.setAttribute('aria-expanded', 'false');
			} else {
				if (autoCollapse) {
					const activeTriggers = accordion.querySelectorAll('.ecp-accordion-trigger.active');
					activeTriggers.forEach(trigger => {
						if (trigger !== item) {
							trigger.classList.remove('active');
							trigger.setAttribute('aria-expanded', 'false');
							const content = trigger.nextElementSibling;
							if (content) {
								content.classList.remove('active');
								content.setAttribute('hidden', 'true');
							}
						}
					});
				}

				item.classList.add('active');
				item.nextElementSibling.classList.add('active');
				item.setAttribute('aria-expanded', 'true');
				item.nextElementSibling.removeAttribute('hidden');
			}
		});
	});
});



/*******************************************************/
/*  Add Parent Arrow SVG
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var menu_items_with_children = document.querySelectorAll('.ecp-menu.ecp-menu-depth-all > ul > li.menu-item-has-children');
	for (var i = 0; i < menu_items_with_children.length; i++) {
		menu_items_with_children[i].insertAdjacentHTML('beforeend', '<span class="ecp-icon ecp-menu-icon-parent"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" class="svg-inline--fa fa-chevron-down fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg></span>');
	}

});


/*******************************************************/
/*  Simple countdown
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var countdowns = document.querySelectorAll('.ecp-countdown');

	countdowns.forEach(item => {

		var countDownDate = item.getAttribute('data-countdown-date');
		countDownDate = new Date(countDownDate).getTime();

		var now = new Date().getTime();
		var distance = countDownDate - now;
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);

		var countDownFormat = item.getAttribute('data-countdown-format');

		output = countDownFormat;
		output = output.replace("{d}", days);
		output = output.replace("{h}", hours);
		output = output.replace("{m}", minutes);

		if (distance >= 0) {
			item.innerHTML = output;
		}

	});

});


/*******************************************************/
/*  Radio buttons to star ratings
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var radio_buttons_to_stars = document.querySelectorAll('.ecp-radiobuttons-to-stars input');

	function prevAll(element) {
		var result = [];
		while (element = element.previousElementSibling)
			result.push(element);
		return result;
	}

	radio_buttons_to_stars.forEach(item => {

		item.addEventListener('click', event => {

			event.preventDefault();

			item.closest('ul').querySelector('li.active').classList.remove('active');

			item.closest('li').classList.add('active');

			var previous_siblings = prevAll(item);

			previous_siblings.forEach(item => {
				item.classList.add('active');
			});

		});

	});

});


/*******************************************************/
/*  Prevent keyboard popup when clicking in Gravity Forms date picker
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	function setDatePickersToReadOnly() {
		var date_pickers = document.querySelectorAll('.ecp-breakpoint-small .datepicker');

		date_pickers.forEach(item => {
			item.readOnly = true;
		});
	}

	setDatePickersToReadOnly();

	var gf_next_buttons = document.querySelectorAll('.gform_next_button');

	gf_next_buttons.forEach(item => {

		item.addEventListener('click', event => {

			setTimeout(function() {
				setDatePickersToReadOnly();
			}, 500);

		});

	});

});


/*******************************************************/
/*  Animation on hover (via animate.css)
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var animate_on_hovers = document.querySelectorAll('[class*="ecp-animate-hover"]');

	animate_on_hovers.forEach(item => {

		item.addEventListener('mouseenter', event => {

			var classes = item.getAttribute('class').split(' ');

			for (var i = 0; i < classes.length; i++) {
			  var matches = /^ecp-animate-hover\-(.+)/.exec(classes[i]);
			  if (matches != null) {
				var animation = matches[1];
			  }
			}

			item.classList.add('animated '+animation);

		});

		item.addEventListener('webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd', event => {

			var classes = item.getAttribute('class').split(' ');
			for (var i = 0; i < classes.length; i++) {
			  var matches = /^ecp-animate-hover\-(.+)/.exec(classes[i]);
			  if (matches != null) {
				var animation = matches[1];
			  }
			}

			item.classList.remove('animated '+animation);

		});

	});

});


/*******************************************************/
/*  Track Appointment Type in GA
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var gform_buttons = document.querySelectorAll('.gform_button.button');

	gform_buttons.forEach(item => {

		item.addEventListener('click', event => {

			for (const label of document.querySelectorAll('label')) {
                if (label.textContent.includes('New patient') || 
					label.textContent.includes('New client') ||
					label.textContent.toLowerCase().includes('new patient') || 
					label.textContent.toLowerCase().includes('new client')
				) {
                    var NewPatientID = label.getAttribute('for');
                }

				if (label.textContent.includes('Returning patient') || 
					label.textContent.includes('Returning client') ||
					label.textContent.toLowerCase().includes('returning patient') ||
					label.textContent.toLowerCase().includes('returning client')
				) {
                    var ReturningPatientID = label.getAttribute('for');
                }
            }

			if ( 'sessionStorage' in window ) {
				try {
					var NewPatientInput = document.querySelector('#'+NewPatientID);
					if (NewPatientInput && NewPatientInput.checked == true) {
						sessionStorage.setItem('ecpTypeClient', 'New patient');
					}
					var ReturningPatientInput = document.querySelector('#'+ReturningPatientID);
					if (ReturningPatientInput && ReturningPatientInput.checked == true) {
						sessionStorage.setItem('ecpTypeClient', 'Returning patient');
					}
				} catch(e) {}
			}

		});

	});

});


/*******************************************************/
/*  Tab Headings
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var html_tag = document.getElementsByTagName('html')[0];
	if (html_tag.classList.contains('fl-builder-edit')) return;

	var rows = document.querySelectorAll('.fl-row');
	rows.forEach((row, index, array) => {

		var heading_tabs = row.querySelectorAll('[data-tab-target]');

		heading_tabs.forEach((item, index, array) => {

			var target = item.getAttribute('data-tab-target');

			if (index == 0) item.classList.add('active');
			if (index != 0) document.querySelector(target).style.display = 'none';

			var siblings = item.closest('.fl-row').querySelectorAll('[data-tab-target]');

			item.addEventListener('click', event => {

				siblings.forEach((sibling_item, index, array) => {

					var sibling_target = sibling_item.getAttribute('data-tab-target');
					document.querySelector(sibling_target).style.display = 'none';

					sibling_item.classList.remove('active');

				});

				document.querySelector(target).style.display = 'block';
				item.classList.add('active');

			});

		});

	});

});


/*******************************************************/
/*  Reviews Widget
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var reviews_widget = document.querySelector('.ecp-reviews-widget');

	if ( typeof(reviews_widget) != 'undefined' && reviews_widget != null) {

		var website = reviews_widget.getAttribute('data-site');
		var url = 'https://gmb.ecpresources.net/reviews-widget/'+website;

		fetch(url).then(res => res.json()).then(data => {

			var items = '';
			var reviews = data.data;
			var review_average = 0;

			reviews.forEach((review, index, array) => {

				var is_cropped = false;
				var reviewer_comment = review.comment;

				var reviewer_comment_cropped = ''
				if (reviewer_comment && reviewer_comment.length > 175) {
					reviewer_comment_cropped = reviewer_comment.replace(/(^\s+|\s+$)/g,'').substring(0, 175).split(' ').slice(0, -1).join(' ') + '<span class="review-expand">...</span>';
					var is_cropped = true;
				} else {
					reviewer_comment_cropped = reviewer_comment;
				}
				var reviewer_name = review.reviewer.displayName;
				var reviewer_rating = review.starRating

				if (reviewer_rating == '5') {
					reviewer_rating = '<img src="/wp-content/themes/_default/images/review-5-stars.png" alt="5 Stars" />';
					review_average = review_average+5;
				}
				if (reviewer_rating == '4') {
					reviewer_rating = '<img src="/wp-content/themes/_default/images/review-4-stars.png" alt="4 Stars" />';
					review_average = review_average+4;
				}

				var today = new Date();
				var msInDay = 24 * 60 * 60 * 1000;

				var reviewer_date = review.createTime.date.replace(' ', 'T');  // iOS doesn't like the space
				reviewer_date = new Date(reviewer_date);

				var days_ago = (+today - +reviewer_date)/msInDay;
				days_ago = Math.trunc(days_ago)

				if (reviewer_comment) {
					items+= '<li class="review splide__slide"><div class="review-comment"><span class="review-comment-cropped">' + reviewer_comment_cropped + '</span><span class="review-comment-full">' + reviewer_comment + '</span></div><div class="review-name" style="display:none">' + reviewer_name + '</div><div class="review-footer"><div class="review-stars">' + reviewer_rating + '</div><div class="review-time">'+days_ago+' days ago</div></div></li>' ;
				}

			});

			var item_count = reviews.length;

			document.querySelector('.ecp-reviews-widget-heading-count').innerHTML = item_count;

			review_average = Number(review_average)/Number(item_count);
			review_average = review_average.toFixed(2)
			document.querySelector('.ecp-reviews-widget-heading-average').innerHTML = review_average;

			document.querySelector('.ecp-reviews-widget-list ul.splide__list').innerHTML = items;

			var reviews_widget_slideshow = new Splide( '.ecp-reviews-widget-list', {perPage: 1, pagination: false} ).mount();

			document.querySelector('.ecp-reviews-widget-heading span').addEventListener('click', function(event) {

				if (reviews_widget.classList.contains('minimized')) {

					reviews_widget.classList.remove('minimized');
					reviews_widget.classList.remove('expanded');
					reviews_widget.classList.add('open');

					reviews_widget_slideshow.refresh();

				} else {

					reviews_widget.classList.add('minimized');
					reviews_widget.classList.remove('expanded');
					reviews_widget.classList.remove('open');

				}

			});

			var expand_links = document.querySelectorAll('.review-expand');

			expand_links.forEach(expand_link => {

				expand_link.addEventListener('click', event => {
					expand_link.closest('.review').classList.add('expanded');
				});

			});

		}).catch(function() {


		});

	}

});



/*******************************************************/
/*  Lightbox Galleries (GLightbox)
/*******************************************************/

const lightbox_gallery = GLightbox({
	selector: '[target="lightbox_gallery"]',
	openEffect: 'fade',
	touchNavigation: true,
	loop: true,
	autoplayVideos: true
});



/*******************************************************/
/*  Popovers
/*******************************************************/

document.addEventListener('DOMContentLoaded', function() {

	var ecp_trigger_flyout = document.querySelectorAll('.ecp-trigger-flyout');
	ecp_trigger_flyout.forEach(function (node) {
		var content = node.querySelector('.ecp-post-flyout-content');
		tippy(node, {
			theme: 'light',
			trigger: 'click',
			arrow: true,
			interactive: true,
			content: content.innerHTML,
			allowHTML: true,
			appendTo: document.body,
		});
	});
	var ecp_target_popover = document.querySelectorAll('a[target="popover"]');
	ecp_target_popover.forEach(function (node) {
		var id = node.getAttribute('href');

		if (!id.includes('http') && id != '#') {
			var content = document.querySelector(id);
			tippy(node, {
				theme: 'light',
				trigger: 'click',
				arrow: true,
				interactive: true,
				content: content.innerHTML,
				allowHTML: true,
				appendTo: document.body,
			});
		}
	});
	var data_popover_content = document.querySelectorAll('[data-popover-content]');
	data_popover_content.forEach(function (node) {
		var content = node.getAttribute('data-popover-content');

		tippy(node, {
			theme: 'light',
			trigger: 'click',
			arrow: true,
			interactive: true,
			content: content,
			allowHTML: true,
			appendTo: document.body,
		});
	});

});


/*******************************************************/
/*  Mobile Nav Select Dropdown
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var ecp_navs = document.querySelectorAll('.ecp-nav:not(.panel)');

	ecp_navs.forEach((nav, index, array) => {

		nav.innerHTML = nav.innerHTML + '<select class="ecp-nav-mobile" id="ecp-nav-mobile" />';

		var select = nav.querySelector('select');

		select.innerHTML ='<option value="">Go to...</option>';

		var anchors = nav.querySelectorAll('a')

		anchors.forEach((anchor, index, array) => {

			var da = '';
			var childpage = '';
			var menu_id = anchor.parentNode.getAttribute('id');

			if (anchor.closest('.sub-menu')) {
				da = '- ';
				childpage = 'ecp-nav-childpage';
			}

			var selected = '';

			if (anchor.parentNode.classList.contains('current-menu-item')) {
				selected = 'selected';
			}

			select.innerHTML += '<option value="'+ anchor.getAttribute('href') +'" class="'+childpage+' '+menu_id+'" '+selected+'>'+da + anchor.textContent+'</option>';

		});

		select.addEventListener('change', event => {

			window.location = event.target.value;

		});

	})


});


/*******************************************************/
/*  Custom Menu > Mobile Menu Type > Dropdown
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var ecp_navs = document.querySelectorAll('.ecp-menu-mobile-type-dropdown');

	ecp_navs.forEach((nav, index, array) => {

		var dropdown_content = nav.querySelector('.ecp-menu-dropdown-content');

		dropdown_content.innerHTML = dropdown_content.innerHTML + '<select class="ecp-nav-mobile" id="ecp-nav-mobile" />';

		var select = dropdown_content.querySelector('select');

		select.innerHTML ='<option value="">Go to...</option>';

		var anchors = nav.querySelectorAll('a')

		anchors.forEach((anchor, index, array) => {

			var da = '';
			var childpage = '';
			var menu_id = anchor.parentNode.getAttribute('id');

			if (anchor.closest('.sub-menu')) {
				da = '- ';
				childpage = 'ecp-nav-childpage';
			}

			var selected = '';

			if (anchor.parentNode.classList.contains('current-menu-item')) {
				selected = 'selected';
			}

			select.innerHTML += '<option value="'+ anchor.getAttribute('href') +'" class="'+childpage+' '+menu_id+'" '+selected+'>'+da + anchor.textContent+'</option>';

		});

		select.addEventListener('change', event => {

			window.location = event.target.value;

		});

	})


});


/*******************************************************/
/*  Custom Menu > Mobile Menu Type > Hamburger +- links
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var accordion_parents = document.querySelectorAll('.ecp-menu-accordion li.menu-item-has-children');

	accordion_parents.forEach((li, index, array) => {

		const anchor = li.querySelector('a');

		if (! li.querySelector('.ecp-menu-parent-trigger')) {

			var trigger = document.createElement('a');
			trigger.setAttribute('href', '#');
			trigger.classList.add('ecp-menu-parent-trigger');
			trigger.setAttribute('aria-expanded', 'false');
			trigger.setAttribute('aria-label', 'Toggle Mobile Menu');
			trigger.innerHTML = '<span class="ecp-menu-parent-trigger-icon-inactive"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="svg-inline--fa fa-plus fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg></span><span class="ecp-menu-parent-trigger-icon-active"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" class="svg-inline--fa fa-minus fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg></span>';
			anchor.after(trigger);

			li.addEventListener('click', event => {

				event.stopImmediatePropagation();

				var ul = li.querySelector(':scope > ul');

				var this_trigger = li.querySelector(':scope > .ecp-menu-parent-trigger');

				if (this_trigger.classList.contains('ecp-menu-parent-trigger-active')) {

					ul.style.display = 'none';
					this_trigger.classList.remove('ecp-menu-parent-trigger-active');
					trigger.setAttribute('aria-expanded', 'false');

				} else {

					ul.style.display = 'block';
					this_trigger.classList.add('ecp-menu-parent-trigger-active');
					trigger.setAttribute('aria-expanded', 'true');

				}

			});

		}

	});

});


/*******************************************************/
/*  Custom Menu > Mobile Menu Type > Hamburger Toggle Buttons (hamburger button, close button in overlay)
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var menu_toggle_buttons = document.querySelectorAll('.ecp-menu-hamburger-trigger-button, .ecp-menu-hamburger-trigger-close');

	menu_toggle_buttons.forEach((button, index, array) => {

		button.addEventListener('click', event => {

			event.preventDefault()
			event.stopImmediatePropagation();

			document.body.classList.toggle('ecp-menu-hamburger-open');

			setTimeout(() => {
				let close_button = document.querySelector('.ecp-menu-mobile-active .ecp-menu-hamburger-trigger-close');
				if (close_button) {
					document.querySelector('.ecp-menu-mobile-active .ecp-menu-hamburger-trigger-close').focus();
				} else {
					button.closest('.ecp-menu-wrapper').querySelector('.ecp-menu-hamburger-trigger-button').focus();
				}
			}, 100);
		
			button.closest('.ecp-menu-mobile').classList.toggle('ecp-menu-mobile-active');

		});

	});

});


/*******************************************************/
/*  Mobile menu overlay focus trap
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	(document.querySelectorAll('.ecp-menu-mobile-focus-trap').forEach(button => button.addEventListener('focus', function (event) {
		event.preventDefault();
		button.closest('.ecp-menu-hamburger-content')?.querySelector('.ecp-menu-hamburger-trigger-close')?.focus();	
	})));

});


/*******************************************************/
/*  Custom Menu > Mobile Menu Type > Close menu on anchor link click
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var menu_anchor_links = document.querySelectorAll('.ecp-menu-accordion li:not(.menu-item-has-children) > a');

	menu_anchor_links.forEach((anchor, index, array) => {

		anchor.addEventListener('click', event => {

			// Check if the href contains an anchor link (includes #)
			var href = anchor.getAttribute('href');
			if (href && href.includes('#')) {

				// Close the mobile menu
				document.body.classList.remove('ecp-menu-hamburger-open');

				// Remove active class from the mobile menu
				var activeMenu = document.querySelector('.ecp-menu-mobile-active');
				if (activeMenu) {
					activeMenu.classList.remove('ecp-menu-mobile-active');
				}

			}

		});

	});

});

/*******************************************************/
/*  Add hover class to support keyboard navigation for flyouts
/*******************************************************/

document.addEventListener('DOMContentLoaded', function () {

	document.body.addEventListener('focusin', function (event) {
		const target = event.target;
		if (target.matches('.ecp-menu a')) {
			const currentLi = target.closest('li');
			const parent = currentLi?.parentElement;
			if (parent) {
				const siblingLis = [...parent.children].filter(el =>
					el !== currentLi && el.tagName === 'LI'
				);
				siblingLis.forEach(li => li.classList.remove('hover'));
			}
			target.parentElement.classList.add('hover');
		} else {
			[...document.querySelectorAll('.ecp-menu li')].forEach(function(el) {
			  el.classList.remove('hover');
			});
		}
	});

	
});



/*******************************************************/
/*  Sticky Content
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	function getCookie(name) {
		var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
		return v ? v[2] : null;
	}
	function setCookie(name, value, days) {
		var d = new Date;
		d.setTime(d.getTime() + 24*60*60*1000*days);
		document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
	}

	var sticky_content_items = document.querySelectorAll('.ecp-stickycontent');

	sticky_content_items.forEach((item, index, array) => {

		var id = item.getAttribute('data-id');
		var testmode = item.getAttribute('data-testmode');
		var position = item.getAttribute('data-position');
		var expires = item.getAttribute('data-expires');
		var bypass_cookie = item.getAttribute('data-lightbox-bypass-cookie');

		var cookie = getCookie('ecp-stickycontent-'+id);

		if (! cookie || testmode == 'true' || bypass_cookie) {

			item.style.display = 'block';
			item.classList.add('ecp-stickycontent-active');
			document.body.classList.add('ecp-stickycontent-active');


			if ( document.body.classList.contains('admin-bar') && (position == 'top' || position == 'topleft' || position == 'topright') ) {
				item.style.top = '32px';
			}

			if (position == 'top') {
				var y_scroll_pos = window.pageYOffset;

				var stickycontentHeight = item.offsetHeight;
				var placeholder = document.createElement('div');
				placeholder.style.height = stickycontentHeight+'px';
				placeholder.setAttribute('id', 'ecp-stickycontent-placeholder-'+id);
				placeholder.setAttribute('class', 'ecp-stickycontent-placeholder');

				var first_child_element = document.body.firstChild;
				first_child_element.parentNode.insertBefore(placeholder, first_child_element);

			}

			var close_button = item.querySelector('.ecp-stickycontent-close');

			if (close_button) {

				close_button.addEventListener('click', event => {

					event.preventDefault();

					if (expires) expires = Number(expires);

					setCookie('ecp-stickycontent-' + id, true, (expires ? expires : 30));

					item.style.display = 'none';

					var placeholder = document.querySelector('#ecp-stickycontent-placeholder-' + id);

					placeholder.parentNode.removeChild(placeholder);

					item.classList.remove('ecp-stickycontent-active');

					document.body.classList.remove('ecp-stickycontent-active');

				});

			}


		} else {

			item.classList.add('ecp-sticky-user-hidden');

		}


	});

});


/*******************************************************/
/*  Accordion Headings (Acts on next element)
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var accordion_headings_next = document.querySelectorAll('.ecp-heading-accordion[data-accordion-target-next]');

	if (accordion_headings_next) {

		var enabled_accordion_heading_next = document.querySelector('.ecp-heading-accordion.enabled.active[data-accordion-target-next]');
		if (enabled_accordion_heading_next) enabled_accordion_heading_next.closest('.fl-module').nextElementSibling.style.display = 'block';

		function setHeaderAccordionStateNext() {

			document.querySelectorAll('.ecp-heading-accordion').forEach((el) => {el.classList.remove('enabled');});
			document.querySelectorAll('.ecp-heading-accordion.ecp-heading-accordion-desktop[data-accordion-target-next]').forEach((el) => {el.classList.add('enabled');});
			document.querySelectorAll('body.ecp-breakpoint-medium .ecp-heading-accordion.ecp-heading-accordion-mobile[data-accordion-target-next]').forEach((el) => {el.classList.add('enabled');});
			document.querySelectorAll('body.ecp-breakpoint-small .ecp-heading-accordion.ecp-heading-accordion-mobile[data-accordion-target-next]').forEach((el) => {el.classList.add('enabled');});

			if (! document.documentElement.classList.contains('fl-builder-edit')) {
				var disabled_accordion_heading_next = document.querySelectorAll('.ecp-heading-accordion.enabled[data-accordion-target-next]:not(.active)');
				disabled_accordion_heading_next.forEach((disabled_accordion_heading_next_item, index, array) => {
					disabled_accordion_heading_next_item.closest('.fl-module').nextElementSibling.style.display = 'none';
				});
			}

		}

		setHeaderAccordionStateNext();

		document.addEventListener( 'resize', function () {
			setHeaderAccordionStateNext();
		});

		accordion_headings_next.forEach((item, index, array) => {

			item.addEventListener('click', event => {

				item.classList.toggle('active');

				var next_element = item.closest('.fl-module').nextElementSibling

				if (window.getComputedStyle(next_element).display === 'none') {
					next_element.style.display = 'block';
				} else {
					next_element.style.display = 'none';
				}

			});

		});

	}

});


/*******************************************************/
/*  Accordion Headings (Acts on class)
/*******************************************************/

document.addEventListener( 'DOMContentLoaded', function () {

	var accordion_headings_class = document.querySelectorAll('.ecp-heading-accordion[data-accordion-target]');

	if (accordion_headings_class) {

		function setHeaderAccordionStateTarget() {

			document.querySelectorAll('body.ecp-breakpoint-large .ecp-heading-accordion.ecp-heading-accordion-desktop[data-accordion-target]').forEach((el) => {el.classList.add('enabled');});
			document.querySelectorAll('body.ecp-breakpoint-medium .ecp-heading-accordion.ecp-heading-accordion-tablet[data-accordion-target]').forEach((el) => {el.classList.add('enabled');});
			document.querySelectorAll('body.ecp-breakpoint-small .ecp-heading-accordion.ecp-heading-accordion-mobile[data-accordion-target]').forEach((el) => {el.classList.add('enabled');});

			document.querySelectorAll('body.ecp-breakpoint-large .ecp-heading-accordion.ecp-heading-accordion-tablet[data-accordion-target]').forEach((el) => {el.classList.remove('enabled');});
			document.querySelectorAll('body.ecp-breakpoint-large .ecp-heading-accordion.ecp-heading-accordion-mobile[data-accordion-target]').forEach((el) => {el.classList.remove('enabled');});
			document.querySelectorAll('body.ecp-breakpoint-medium .ecp-heading-accordion.ecp-heading-accordion-mobile[data-accordion-target]').forEach((el) => {el.classList.remove('enabled');});

			if (! document.documentElement.classList.contains('fl-builder-edit')) {
				var disabled_accordion_heading_class = document.querySelectorAll('.ecp-heading-accordion.enabled[data-accordion-target]:not(.active)');
				disabled_accordion_heading_class.forEach((disabled_accordion_heading_class_item, index, array) => {
					var target = disabled_accordion_heading_class_item.getAttribute('data-accordion-target');
					document.querySelectorAll('.'+target).forEach((el) => {el.style.display = 'none';});
				});
			}

		}

		setHeaderAccordionStateTarget();

		document.addEventListener( 'resize', function () {
			setHeaderAccordionStateTarget();
		});

		accordion_headings_class.forEach((item, index, array) => {

			item.addEventListener('click', event => {

				var target = item.getAttribute('data-accordion-target');

				document.querySelectorAll('.'+target).forEach((el) => {

					el.classList.toggle('active');

					if (window.getComputedStyle(el).display === 'none') {
						el.style.display = 'block';
					} else {
						el.style.display = 'none';
					}

				});

			});

		});

	}

});


/*******************************************************/
/*  Randomize a style or attribute on the page
/*******************************************************/

document.addEventListener("DOMContentLoaded", function(event){

	if (window.randomizeElements) {
		window.randomizeElements.forEach(function (item) {

			let element = document.querySelector(item.selector);

			if (! element) return;

			let random_choice = item.array[~~(Math.random() * item.array.length)];

			setTimeout(function() {

				if (item.style && item.style == 'backgroundImage') {
					element.style[item.style] = 'url("'+random_choice+'")';
				}

				if (item.attribute) {
					element.setAttribute(item.attribute, random_choice);
				}

			}, 100);

		});
	}

});


/****************************************************************************************************************************************/
/*  jQuery Scripting
/****************************************************************************************************************************************/

jQuery(document).ready(function($) {


/*******************************************************/
/*  Lightbox (Content)
/*******************************************************/

function initMagnificPopup(){

	$(".ecp-trigger-lightbox, a[target='lightbox']").magnificPopup({
		gallery: {enabled: false},
		mainClass: 'mfp-fade',
		removalDelay: 300
	});

	/* On load lightboxes */
	$(".ecp-lightbox[data-lightbox-trigger='onload']").each(function(){

		var trigger = $(this).attr('data-lightbox-trigger');
		var id = $(this).attr('id');
		var bypass_cookie = $(this).attr('data-lightbox-bypass-cookie');

		if (! $.cookie('ecp-lightbox-' + id) || bypass_cookie) {

			$.magnificPopup.open({
				items: {
					src: '#' + id,
					type:'inline'
				},
			});
			$.cookie('ecp-lightbox-' + id, true, {path: "/"});

		}

	});

	$('.ecp-lightbox-close').on("click", function() {
	  $.magnificPopup.close();
	});


}
initMagnificPopup();






}); /* End jQuery */
