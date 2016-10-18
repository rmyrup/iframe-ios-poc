function handleLocaleChange(){localeLabels.previousSlide=mhe.i18n.tr("previous"),localeLabels.nextSlide=mhe.i18n.tr("next"),localeLabels.slideNum=mhe.i18n.tr("slide-num"),$('#next[role="button"]').attr("aria-label",localeLabels.nextSlide),$('#previous[role="button"]').attr("aria-label",localeLabels.previousSlide),$('.ui-slider-tick-mark[role="button"]').each(function(a,b){$(this).attr("aria-label",localeLabels.slideNum+" "+$(this).attr("data-slide-number"))})}try{var iframe=window.frameElement,winParent=window.parent;$(winParent.document).ready(function(){var a=winParent.jQuery;a&&(a(iframe).trigger("iframeloading"),$(function(){a(iframe).trigger("iframeready")}))})}catch(a){}var scale=1,ctrlOrientation="horizontal",sliderHorizontalWidth,currentDocHeight,currentDocWidth,procrustes,localeLabels={};mhe.i18n.init("../shared/").then(handleLocaleChange),$(document).ready(function(){function a(a){var b=a.data,c=b.action||b.type;switch(c){case"widget-display-context":b.properties.themeCssFile&&mhe.linkToThemeCSS(b.properties.themeCssFile);break;case"locale":mhe.i18n.changeToLocale(b.properties.locale).then(handleLocaleChange)}}function b(a,b){$(".image").each(function(){this.getAttribute("id")!=="image"+a&&this.getAttribute("id")!=="image"+b&&$(this).css({opacity:0})})}function c(){Q=$("#image-temp").html().replace(/\/\/<\!\[CDATA\[|\/\/\]\]>/g,""),R=$("#label-temp").html().replace(/\/\/<\!\[CDATA\[|\/\/\]\]>/g,""),S=$("#caption-temp").html().replace(/\/\/<\!\[CDATA\[|\/\/\]\]>/g,""),T=Handlebars.compile(Q),U=Handlebars.compile(R),V=Handlebars.compile(S),W=$("#slide_images"),X=$("#slide_labels"),Y=$("#slide_captions")}function d(a){var b=G.filter(function(b){return b.name===a})[0];$("#widget_container").append(b.htmlString)}function e(){var a=$("#slider"),b=a.slider("value"),c=1;q=$("#slide_images .image").length,b<q&&(a.slider("value",b+c),i(a.ui))}function f(){var a=$("#slider"),b=a.slider("value"),c=1;a.slider("value",b-c),i(a.ui)}function g(){$(".hilites").remove(),I=!1}function h(a){$(".image").css({visibility:"visible"}).attr("aria-hidden",!0),$(".label").css({visibility:"hidden"}),$(".caption").css({visibility:"hidden"}),$(".overlay").css({visibility:"hidden"})}function i(a){$(".ui-slider-handle").removeClass("pulsing");var b=Math.abs(Math.round($("#slider").slider("value")));"vertical"===ctrlOrientation?$("#slider").slider("value",-b):$("#slider").slider("value",b),s=document.getElementById("image"+(b-1)),t=document.getElementById("image"+b),u=document.getElementById("image"+(b+1)),v=document.getElementById("label"+(b-1)),w=document.getElementById("label"+b),x=document.getElementById("label"+(b+1)),y=document.getElementById("caption"+(b-1)),z=document.getElementById("caption"+b),A=document.getElementById("caption"+(b+1));var c=$(".overlays"+b);$(".image").css({opacity:0,visibility:"hidden"}),$(".label").css({opacity:0,visibility:"hidden"}),$(".caption").css({opacity:0,visibility:"hidden"}),$(".overlay").css({opacity:0,visibility:"hidden"}),$(t).css({opacity:1,visibility:"visible"}).attr("aria-hidden",!1),$(w).css({opacity:1,visibility:"visible"}),$(z).css({opacity:1,visibility:"visible"}),$(c).css({opacity:1,visibility:"visible"}),C=b,D=b}function j(){$("#slide_images #image1").css({opacity:1,visibility:"visible"}),$("#slide_labels #label1").css({opacity:1,visibility:"visible"}),$("#slide_captions #caption1").css({opacity:1,visibility:"visible"}),$("#slide_images .overlay").css({opacity:0,visibility:"hidden"}),$("#slide_images .overlays1").css({opacity:1,visibility:"visible"}),t=document.getElementById("image1"),w=document.getElementById("label1"),z=document.getElementById("caption1");var a={height:"400px",animate:!0,value:1,step:.01,start:function(a,b){h(b)},slide:function(a,c){var d,e;$(".ui-slider-handle").removeClass("pulsing"),d=Math.abs(c.value),e=Math.floor(d),r=d-e;var f=Math.floor(d),g=Math.ceil(d);if(D>0&&D!==f&&D!==g){var h=$("#image"+D);h.css("opacity",0)}s=document.getElementById("image"+(e-1)),t=document.getElementById("image"+e),u=document.getElementById("image"+(e+1)),v=document.getElementById("label"+(e-1)),w=document.getElementById("label"+e),x=document.getElementById("label"+(e+1)),y=document.getElementById("caption"+(e-1)),z=document.getElementById("caption"+e),A=document.getElementById("caption"+(e+1)),Math.abs(c.value)>C&&($(t).css("opacity",1-r),$(u).css("opacity",r)),Math.abs(c.value)<C&&($(t).css("opacity",1-r),$(u).css("opacity",r)),Math.floor(C)!==e&&b(f,g),C=Math.abs(c.value)},stop:function(a,b){i(b)},change:function(){sendCaliperNavigationEvent()}};ctrlOrientation.indexOf("vertical")!==-1?a.orientation="vertical":a.orientation="horizontal","vertical"===ctrlOrientation?(a.min=-$("#slide_images .image").size(),a.max=-1):(a.min=1,a.max=$("#slide_images .image").size()),$("#slider").slider(a)}function k(){var a,b;a=ctrlOrientation.indexOf("vertical")!==-1?"top":"left";var c=$("#slider"),d=Math.abs(c.slider("option","max")),e=Math.abs(c.slider("option","min"));if(e>d&&(d=e),b=d>1?100/(d-1):50,c.find(".ui-slider-tick-mark").remove(),"vertical"===ctrlOrientation){for(var f=d-1;f>=0;f--)$('<span class="ui-slider-tick-mark" role="button" tabindex="0" data-slide-number="'+(f+1)+'"></span>').css(a,b*f+"%").appendTo(c);$(".ui-slider-tick-mark").addClass("ui-slider-tick-mark-vertical")}else if("vertical-up"===ctrlOrientation){for(var g=0;g<d;g++)$('<span class="ui-slider-tick-mark" role="button" tabindex="0" data-slide-number="'+(g+1)+'"></span>').css(a,b*g+"%").appendTo(c);$(".ui-slider-tick-mark").addClass("ui-slider-tick-mark-vertical")}else{for(var h=0;h<d;h++)$('<span class="ui-slider-tick-mark" role="button" tabindex="0" data-slide-number="'+(h+1)+'"></span>').css(a,b*h+"%").appendTo(c);$(".ui-slider-tick-mark").addClass("ui-slider-tick-mark-horizontal")}}function l(){var a=navigator.vendor&&navigator.vendor.indexOf("Apple")>-1;$("#widget_container").imagesLoaded(function(){$(".image img").each(function(b,c){var d,e,f,g=/\.svg$/i,h=$(this).attr("src"),i=g.test(h);i&&$(this).css({width:"100%",height:"auto"}),f="undefined"!=typeof Z.slideData[b].scale&&Z.slideData[b].scale>0&&Z.slideData[b].scale<1?Z.slideData[b].scale:1,0===this.naturalWidth||a?(e=this.offsetHeight,d=this.offsetWidth):(e=this.naturalHeight,d=this.naturalWidth),d=Z.slideData[b].imageWidth>0?Z.slideData[b].imageWidth:d,e=Z.slideData[b].imageHeight>0?Z.slideData[b].imageHeight:e,e*=f,d*=f,E.push(e),F.push(d)});for(var b=0,c=0,d=0;d<E.length;d++)(E[d]>b||E[d]===b&&F[d]>c)&&(b=E[d],c=F[d]);var e,f,g=$("#slide_images").width()/c;e=g<=1?b*g:b;var h=Math.max.apply(null,F),i=$(window).width(),j=0;ctrlOrientation.indexOf("vertical")!==-1&&(j=$("#slide_nav.slide_nav-vertical").outerWidth(!0),h-=j),procrustes||h>i?(f=i,$("#slide_images").css({width:f-j+"px"}),$("#widget_container").css({width:"100%"})):(f=h+j,$("#slide_images").width(h),$("#widget_container").css({width:f+"px"}));var k=$("#slide_images").width();if($("#slide_images").css({height:e+"px"}),$(".image img").each(function(b,c){var d,f,g,i=/\D+(\d+)/,j=$(this).parent().attr("id").match(i)[1];g="undefined"!=typeof Z.slideData[b].scale&&1!==Z.slideData[b].scale?Z.slideData[b].scale:1,0===this.naturalWidth||a?(f=this.offsetHeight,d=this.offsetWidth):(f=this.naturalHeight,d=this.naturalWidth),d=Z.slideData[b].imageWidth>0?Z.slideData[b].imageWidth:d,f=Z.slideData[b].imageHeight>0?Z.slideData[b].imageHeight:f,f*=g,d*=g;var l=k/d,m=f*l,n=d*l;d<=k&&f<=e?($(this).parent().parent().css({width:d,height:f,display:"inherit","margin-left":"auto","margin-right":"auto",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}),$(this).parent().css({width:d,height:f}),$(this).css({width:d,height:f,display:"inherit","margin-left":"auto","margin-right":"auto"}),$(this).parent().attr("data-scale",1),$(".overlays"+j).css({transform:"scale(1)","transform-origin":"0% 0%",width:"100%"})):d<=k&&m>e?($(this).parent().parent().css({width:e/f*d+"px",height:e+"px",display:"inherit","margin-left":"auto","margin-right":"auto",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}),$(this).parent().css({width:e/f*d+"px",height:e+"px"}),$(this).css({width:e/f*d+"px",height:e+"px",display:"inherit","margin-left":"auto","margin-right":"auto"}),$(this).parent().attr("data-scale",e/f),$(".overlays"+j).css({transform:"scale("+e/f+")","transform-origin":"0% 0%",width:n+"px"})):n>=k&&m<=e?($(this).parent().parent().css({width:k+"px",height:k/d*f+"px",display:"inherit","margin-left":"auto","margin-right":"auto",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}),$(this).parent().css({width:k+"px",height:k/d*f+"px"}),$(this).css({width:k+"px",height:k/d*f+"px",display:"inherit","margin-left":"auto","margin-right":"auto"}),$(this).parent().attr("data-scale",k/d),$(".overlays"+j).css({transform:"scale("+k/d+")","transform-origin":"0% 0%",width:k*d/h+"px"})):n<=k&&m>=e&&($(this).parent().parent().css({width:e/m*n+"px",height:e+"px",display:"inherit","margin-left":"auto","margin-right":"auto",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}),$(this).parent().css({width:e/m*n+"px",height:e+"px"}),$(this).css({width:e/m*n+"px",height:e+"px",display:"inherit","margin-left":"auto","margin-right":"auto"}),$(this).parent().attr("data-scale",e/m),$(".overlays"+j).css({transform:"scale("+e/m+")","transform-origin":"0% 0%",width:n+"px"}))}),ctrlOrientation.indexOf("vertical")!==-1){var l=$("#slide_images").height(),m=$("#previous").outerHeight(!0),n=$("#next").outerHeight(!0),o=(l-m-n)*scale;$("#slider").height(o);var p=(l-$("#slide_nav").outerHeight(!0))/2;$("#slide_nav").css({"padding-top":p+"px",height:l+"px"})}else sliderHorizontalWidth=$("#slide_images").outerWidth(!0)*scale-95,$("#slider").outerWidth(sliderHorizontalWidth)})}function m(){$("#slide_captions").css({height:0});var a=[];$(".caption").each(function(){var b=$(this).children("p").outerHeight(!0);a.push(b)});var b=Math.max.apply(Math,a);a=[],$("#slide_captions").css({height:b+20}),$("#slide_labels").css({height:0}),$(".label").each(function(){var b=$(this).children("p").outerHeight(!0);a.push(b)});var c=Math.max.apply(Math,a);a=[],$("#slide_labels").css({height:c})}function n(){F=[],E=[],l(),m(),o()}function o(){var a,b;$("#widget_container").imagesLoaded(function(){var c=$(window).width();a=$(document.body).outerHeight(!0),b=$(document.body).outerWidth(!0),(procrustes||b>c)&&(b=c),(currentDocHeight!==a&&currentDocHeight!==a+1||currentDocWidth!==b)&&(s9.view.size({width:"100%",height:a}),$("body").addClass("loaded"),currentDocHeight=a,currentDocWidth=b)})}function p(){if(ctrlOrientation.indexOf("vertical")!==-1?($("#slide_images").prepend('<div id="slide_nav" role="navigation" style="float:right"><div id="next" role="button" aria-label="'+localeLabels.nextSlide+'" tabindex="0"></div><div id="slider"></div><div id="previous" role="button" aria-label="'+localeLabels.previousSlide+'" tabindex="0"></div></div>'),$("#next").addClass("next-vertical"),$("#previous").addClass("previous-vertical"),$("#next").addClass("icon-chevron-up"),$("#previous").addClass("icon-chevron-down"),$("#slide_nav").addClass("slide_nav-vertical"),$("#slide_images").addClass("slide_images-vertical"),$("#slider").addClass("slider-vertical"),$("#slider").addClass("ui-slider-vertical-background"),$("#slide_labels").addClass("slide_labels-vertical")):($(".slide_info.slider_location").append('<div id="slide_nav" role="navigation"><div id="previous" role="button" aria-label="'+localeLabels.previousSlide+'" tabindex="0"></div><div id="slider"></div><div id="next" role="button" aria-label="'+localeLabels.nextSlide+'" tabindex="0"></div></div>'),$("#slide_nav").addClass("slide_nav-horizontal"),$("#slider").addClass("ui-slider-horizontal-background"),$("#previous").addClass("previous-horizontal"),$("#previous").addClass("icon-chevron-left"),$("#next").addClass("next-horizontal"),$("#next").addClass("icon-chevron-right"),$("#slider").addClass("slider-horizontal")),0===Z.slideData.length&&(Z.slideData=[{image:"img/placeholder-image1.svg",caption:"Caption 1",label:"Label 1",index:1},{image:"img/placeholder-image2.svg",caption:"Caption 2",label:"Label 2",index:2},{image:"img/placeholder-image3.svg",caption:"Caption 3",label:"Label 3",index:3}]),$.each(Z.slideData,function(a,b){var c,d=T(b),e=U(b),f=V(b),g="";if(b.label&&X.append(e),b.caption&&Y.append(f),b.hasOwnProperty("overlays")){for(var h=0;h<b.overlays.length;h++)g+='<div class="overlay overlays'+(a+1)+'" style="top: '+b.overlays[h].overlayPositionTop+"%; left: "+b.overlays[h].overlayPositionLeft+"%; position: absolute; z-index: "+(h+1)+'; padding: 1%; width: auto;">'+b.overlays[h].overlayContent+"</div>";c=$(d).append(g),W.append(c)}else W.append(d)}),0===$(".label").length&&($("#slide_labels").hide(),$("#slide_captions").css({"border-top":"none"})),0===$(".caption").length?$("#slide_captions").hide():m(),$(".label").length){var a=parseInt($("#slide_labels").css("height"),10);$(".label").each(function(){var b=parseInt($(this).css("height"),10),c=(a-b)/2;c>0&&(c+="px",$(this).css("padding-top",c))})}j(),k(),l(),o()}window.addEventListener("message",a,!0);var q,r,s,t,u,v,w,x,y,z,A,B,C=0,D=0,E=[],F=[],G=getLayoutKeys(),H=0,I=!1,J=[];$(document).on("click",function(){$(".hilites").remove(),I=!1}),document.onkeydown=function(a){a.preventDefault(),a=a||window.event;var b=a.charCode||a.keyCode,c=[9,13,40,38];if("horizontal"===ctrlOrientation&&(c=[9,13,37,39]),$.inArray(b,c)!==-1&&(13!==b||I)){if(0===J.length&&(J=$("#slider").children("span").toArray(),J.shift(),"vertical-up"===ctrlOrientation&&J.reverse(),J.unshift($("#previous")),J.push($("#next")),B=J.length-1,H="vertical"===ctrlOrientation?J.length-1:0),37===b)return g(),void f();if(39===b)return g(),void e();if(40===b)return g(),void f();if(38===b)return g(),void e();if(13!==b||I!==!0)9===b&&(a.shiftKey?I===!0?($(".hilites").remove(),"horizontal"===ctrlOrientation||"vertical-up"===ctrlOrientation?H>0&&H--:"vertical"===ctrlOrientation&&H<B&&H++):I=!0:I===!0?($(".hilites").remove(),"horizontal"===ctrlOrientation||"vertical-up"===ctrlOrientation?H<B&&H++:"vertical"===ctrlOrientation&&H>0&&H--):I=!0),"horizontal"===ctrlOrientation?0===H?$("#previous").prepend("<div id='hilite' class='hilites' style='height:30px;width:30px;border:4px solid red;border-style: dotted;top:4px;left:-6px;position:absolute'><div>"):H>=B?$("#next").prepend("<div id='hilite' class='hilites' style='height:30px;width:30px;border:4px solid red;border-style: dotted;top:4px;left:-6px;position:absolute'><div>"):($(J[H]).append("<div id='hilite' class='hilites' style='height:25px;width:25px;'><div>"),$("#hilite").append("<div id='innerhilite' style='height:30px;width:30px;border:4px solid red;border-style: dotted;top:-10px;left:-10px;position:absolute;'><div>")):"vertical"!==ctrlOrientation&&"vertical-up"!==ctrlOrientation||(0===H?$("#previous").prepend("<div id='hilite' class='hilites' style='height:20px;width:20px;border:4px solid red;border-style: dotted;top:-1px;left:-1px;position:absolute'><div>"):H>=B?$("#next").prepend("<div id='hilite' class='hilites' style='height:20px;width:20px;border:4px solid red;border-style: dotted;top:-1px;left:-1px;position:absolute'><div>"):($(J[H]).append("<div id='hilite' class='hilites' style='height:20px;width:20px;'><div>"),$("#hilite").append("<div id='innerhilite' style='height:20px;width:20px;border:4px solid red;border-style: dotted;top:-5px;left:-5px;position:absolute;'><div>")));else if(0===H)f();else if(H===B)e();else{var d=B-H,h=$("#slider");"horizontal"===ctrlOrientation||"vertical-up"===ctrlOrientation?h.slider({},{value:H}):"vertical"===ctrlOrientation&&h.slider("value",-1*d),i(h.ui)}}},$(window).resize(function(){n()}),$(window).load(function(){$(".ui-slider-handle").addClass("pulsing").attr("aria-hidden",!0),setTimeout(function(){MathJax.Hub.Queue(["Typeset",MathJax.Hub],n)},1e3)}),$("#widget_container").on("click","#previous",function(a){$(".image").attr("aria-hidden",!0);var b=$("#slider"),c=b.slider("value"),d=1;b.slider("value",c-d),i(b.ui)}),$("#widget_container").on("click","#next",function(a){$(".image").attr("aria-hidden",!0);var b=$("#slider"),c=b.slider("value"),d=1;q=$("#slide_images .image").length,c<q&&(b.slider("value",c+d),i(b.ui))});var K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z={slideData:[]};if("undefined"!=typeof s9)if(s9.initialParams&&s9.initialParams.configFile){var _=s9.initialParams.configFile;mhe.getConfigFile(_,function(a){for(var b,e,f,g,h,i,j,k,l,m=a.json,n=1;;){if(f=m["image"+n],!f)break;g=m["label"+n],h=m["caption"+n],k=m["slideShortDescription"+n]?m["slideShortDescription"+n]:"",l=m["slideLongDescription"+n]?m["slideLongDescription"+n]:"",i=m["overlays"+n]?JSON.parse(m["overlays"+n]):[],j=m["scale"+n]?m["scale"+n]:1,b=m["imageWidth"+n]>=0?m["imageWidth"+n]:null,e=m["imageHeight"+n]>=0?m["imageHeight"+n]:null,Z.slideData.push({image:f,label:g,caption:h,overlays:i,index:n,scale:j,imageWidth:b,imageHeight:e,slideShortDescription:k,slideLongDescription:l}),n++}procrustes="undefined"==typeof m.widgetSize||"fitImages"!==m.widgetSize,ctrlOrientation=m.orientation?m.orientation:"horizontal",scale=m.scale?m.scale:1,d(m.layout?m.layout:"LbotCbot"),c(),p()},function(a,b,c){})}else if(s9.initialParams&&!s9.initialParams.configFile){K=1;for(var aa,ba;;){if(L=s9.initialParams["image"+K],!L)break;M=s9.initialParams["label"+K],N=s9.initialParams["caption"+K],aa=s9.initialParams["slideShortDescription"+K]?s9.initialParams["slideShortDescription"+K]:"",ba=s9.initialParams["slideLongDescription"+K]?s9.initialParams["slideLongDescription"+K]:"",O=s9.initialParams["overlays"+K]?JSON.parse(s9.initialParams["overlays"+K]):[],P="undefined"!=typeof s9.initialParams["scale"+K]?s9.initialParams["scale"+K]:1,Z.slideData.push({image:L,label:M,caption:N,overlays:O,index:K,scale:P,slideShortDescription:aa,slideLongDescription:ba}),K++}d("LbotCbot"),c(),p()}});