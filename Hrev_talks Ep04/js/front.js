var MYAPP = MYAPP || {};

// MYAPP의 프로퍼티 중복 방지
MYAPP.namespace = function(str){
	var parts = str.split("."),
		parent = MYAPP,
		i;

	// 처음에 중복되는 전역 객체명은 제거
	if(parts[0] === "MYAPP"){
		parts = parts.slice(1);
	}	

	for(i=0; i<parts.length; i++){
		// 프로퍼티가 존재하지 않으면 생성한다.
		if(typeof parent[parts[i]] === "undefined"){
			parent[parts[i]] = {};
		}

		parent = parent[parts[i]];
	}
	return parent;
};

//------------------------MYAPP 시작------------------------------
(function(app, $){
	// 셀렉터 관리자
	app.namespace("mg");
	app.mg = {
		"device":"desktop",				// device default 값
    "browser":null,
		"wrap":$("#wrap"),
		"header":$("#header"),
		"container":$("#container"),
		"footer":$("#footer"),
		"gnb":$("#gnb"),
		"mGnb":$("#m_gnb"),
		"subVisual":$("#container .sub_visual"),
		"mask":$("#mask")
	};
  
  // 디바이스 및 os 감지
	app.namespace("deviceDetect");
	app.deviceDetect = (function(){
		var init = function(){
			var path = location.pathname;
			var $wrap = app.mg.wrap;

			_checkWindow();
      //_checkBrowser();
      app.mg.browser = detectBrowser.checkBrowser();
			
			if(path == "" || path == "/" || path == "/index") {
				$wrap.addClass("main");
			}else{
				$wrap.addClass("sub");
			}

			$(window).resize(function(){
				_checkWindow();
			});
		};

		var _checkWindow = function(){
			var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

			if(w >= 1080) {							// PC
				$("body").attr("data-device", "desktop");
				app.mg.device = "desktop";
			}else if(w > 767 && w < 1080) {		// tablet
				$("body").attr("data-device", "tablet");
				app.mg.device = "tablet";
			}else{									// mobile	
				$("body").attr("data-device", "mobile");
				app.mg.device = "mobile";
			}
		};
    
    /*
    // browser detect
    var _checkBrowser = function(){
      var sBrowser, sUsrAg = navigator.userAgent;
      
      if(sUsrAg.indexOf("Firefox") > -1){
        sBrowser = "Firefox";
      }else if(sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1){
        sBrowser = "Opera";
      }else if(sUsrAg.indexOf("Trident") > -1 || sUsrAg.indexOf("Edge") > -1){
        sBrowser = "IE";
        _checkIEVersion();
      }else if(sUsrAg.indexOf("Chrome") > -1){
        sBrowser = "Chrome";
      }else if(sUsrAg.indexOf("Chrome") > -1 && sUsrAg.indexOf("Safari") > -1){
        sBrowser = "Chrome";
      }else if(sUsrAg.indexOf("Safari") > -1 && sUsrAg.indexOf("Chrome") === -1){
        sBrowser = "Safari";
      }else{
        sBrowser = "unknown";
      }
      $("body").attr("data-browser", sBrowser);
      app.mg.browser = sBrowser;
    };
    
    // IE version check
    var _checkIEVersion = function(){
      if(location.pathname === "/browser") return;          // 크롬 설치 페이지로 오면 동작 안하도록
      
       var word; 
       var version = "N/A"; 

       var agent = navigator.userAgent.toLowerCase(); 
       var name = navigator.appName; 

       // IE old version ( IE 10 or Lower ) 
       if ( name == "Microsoft Internet Explorer" ) word = "msie "; 
       else { 
         // IE 11 
         if ( agent.search("trident") > -1 ) word = "trident/.*rv:"; 
         // Microsoft Edge  
         else if ( agent.search("edge/") > -1 ) word = "edge/"; 
       } 
       var reg = new RegExp( word + "([0-9]{1,})(\\.{0,}[0-9]{0,1})" ); 
       if (  reg.exec( agent ) != null  ) version = RegExp.$1 + RegExp.$2; 
       
      var numVer = Number(version);
      if(typeof(numVer) === "number" && numVer <= 9){     // ie 9버전 이하 사용 안되도록
        window.location.href = "/browser";
        console.log(numVer);
      }
    };*/
		
		return {
			init:init
		}
	})();

	// 사이트 전체 COMMON
  app.namespace("common");
  app.common = (function(){
    var option;
    var defaultOption = {
    	gnbType: "default",						// default: gnb가 fixed로 상단에 고정 / fold: gnb 접힘 및 다른 영역이 상단에 고정
      gnbFixedArea: null,							// gnb 대신 상단에 고정될 영역 selector
      noFixedCallback: null   // gnb 대신 상단에 고정될 영역 fixed 해제되었을 때 콜백
    };
    
    var init = function(opt){
      var num = app.numbering(),
          depth1Num = num.depth1Num,
          depth2Num = num.depth2Num;
      
      option = $.extend(defaultOption, opt, {});
      app.deviceDetect.init();
      app.gnb.init(depth1Num, depth2Num, option.gnbType, option.gnbFixedArea, option.noFixedCallback);
      app.footer.init();
    };

    return {
      init:init
    }
  })();
  
  // Page Numbering
  app.namespace("numbering");
  app.numbering = (function(){
    var $gnb;
    var url,
        urlDepthLng, urlData,
        depth1Num, depth2Num;         // 현재 페이지의 depth1 index, depth2 index
    
    var init = function(){
      $gnb = app.mg.gnb;
      url = location.href;
      urlDepthLng = location.pathname.split("/").length - 1;      // 첫번째 array값은 "" 이므로 실제 뎁스+1이 되어버려서 빼줌
      urlData = location.pathname;
      
      $gnb.find(".hs-menu-depth-1").each(function(i){
        var depth1AUrl = $(this).find(">a").attr("href");
        var d1Lng = depth1AUrl.split("/").length - 1;
        var $depth3Li = $(this).find(".hs-menu-depth-3>li");
        
        if($depth3Li.length > 0){ //depth3가 있을 때
          $depth3Li.each(function(){
            var linkUrl = $(this).find(">a").attr("data-url");
            if(urlData === linkUrl){
              $(this).addClass('on');
            }
          });
        }else if(url.indexOf(depth1AUrl) > -1 && urlDepthLng === d1Lng){         // depth1>a 값과 일치할 때
          depth1Num = i;
          depth2Num = 0;
        }else{
          var $depth2Li = $(this).find(".hs-menu-children-wrapper>ul>li");
          if($depth2Li.length > 0){       // depth2가 있을 때
            $depth2Li.each(function(j){
              var depth2AUrl = $(this).find(">a").attr("href");
              var dDepthLng = depth2AUrl.split("/").length - 1;
              
              if(url.indexOf(depth2AUrl) > -1 && urlDepthLng === dDepthLng){    // depth2>a 값과 일치할 때
                depth1Num = i;
                depth2Num = j;
              }else{
                var dataUrl = $(this).find(">a").attr("data-url");
                
                if($(this).find(">a").attr("data-url") != undefined){
                  var urlArr = dataUrl.split(",");
                 
                  urlArr.forEach(function(v, k){
                    var dDepthLng = v.split("/").length - 1;
                    if(url.indexOf(v) > -1 && dDepthLng < urlDepthLng){         // depth2>a의 data-url 값과 일치할 때
                      depth1Num = i;
                      depth2Num = j;
                    }
                  });
                }
              }
            });
          }
        }
      });
      return {depth1Num:depth1Num, depth2Num:depth2Num};
    };
    
    return init;
  })();

  // GNB
  app.namespace("gnb");
  app.gnb = (function(){
    var $header,
        $gnb,
        $mGnb,
        $btnHam,
        $gnbFixedArea,				// gnb 접히고 상단에 고정될 네비게이션/필터 영역 selector
        gnbFold = false,      // gnb 접혀진 상태
        gnbType,							// gnb 타입
        noFixedCallback;      // gnb대신 고정된 상단 영역이 fixed 해제될 때 발생하는 콜백
    var device,               // 현재 device
        prevDevice,           // 리사이즈 되기 전 device    
        depth1Num,
        depth2Num;            // 현재 페이지의 depth1 index, depth2 index;

    var init = function(d1Num, d2Num, type, area, noFixedCb){
      $header = app.mg.header;
      device = app.mg.device;
      $gnb = app.mg.gnb;
      $gnbFixedArea = area;
      gnbType = type;
      noFixedCallback = noFixedCb;
      depth1Num = d1Num;
      depth2Num = d2Num;
      
      // mGnb 마크업 생성
      var $gnbClone = $gnb.clone().attr("id", "m_gnb");
      $header.append($gnbClone);
      $mGnb = $("#m_gnb");
      $btnHam = $header.find(".btn_ham");
      
      _desktopGnb.init();
      _mobileGnb.init();
      
      $(window).resize(function(){
        device = app.mg.device;
        
        if(device === "desktop" && prevDevice != "desktop"){
          TweenMax.set($header, {overflow:"inherit"});
          _mobileGnb.hide();
        }
        prevDevice = device;
      });
    };

    // desktop GNB
    var _desktopGnb = {
      prevIndex: null,
      gnbReady:true,				// gnb open 여부
      timer: null,					// gnb open timer
      t: 300,								// gnb open 주기
      init:function(){
        //if(device != "desktop") return;
        
        _mobileGnb.hide();            // mobile gnb reset
        
        var $this = this;
        var $depth1 = $gnb.find(".hs-menu-depth-1");
        
        // depth1Num, depth2Num 활성화
        $depth1.eq(depth1Num).addClass("on");
        $depth1.eq(depth1Num).find(".hs-menu-children-wrapper>ul>li").eq(depth2Num).addClass("on");
        
        // gnb 고정
        if(gnbType === "fold"){							// gnb 접히고 다른 영역이 고정
          var browserDetect = navigator.userAgent.indexOf("Firefox"),
          		browserDelta,
          		headerH = $header.height(),
          		gnbFixedAreaOffsetTop = $gnbFixedArea.offset().top,
              prevSTop = 0, 
              sTop = 0,
              tY = 0, prevTY = 0;   // touch start, prev Touch start
          
        	$(window).on("scroll touchmove", function(e){       // 모바일은 touchmove
            sTop = $(window).scrollTop();
            
            if(e.type === "touchmove"){
              tY = e.originalEvent.touches[0].clientY;
              if(tY > prevTY){
                browserDelta = 1;
              }else{
                browserDelta = -1;
              } 
              prevTY = tY;
            }else{
              /*if(browserDetect > -1){				// firefox
                browserDelta = e.originalEvent.detail * -1;				// firefox에선 스크롤 올리면 (-), 내리면 (+). wheelDelta랑 맞추기 위해 -1 곱함   
              }else{												// 나머지 브라우저
                browserDelta = e.originalEvent.wheelDelta;
              }*/
            }
            
            if(gnbFixedAreaOffsetTop <= sTop){			
              // mousewheel로 gnb 접고 펼침
              //if(e.type === "mousewheel" || e.type === "DOMMouseScroll" || e.type === "touchmove"){
                if(browserDelta > 0 || sTop < prevSTop){
                  if(gnbFold === true){
                    TweenMax.killTweensOf($header);
                    //TweenMax.killTweensOf($gnbFixedArea);
                    TweenMax.set($header, {display:"block"});
                    TweenMax.to($header, 0.2, {top:0});
                    TweenMax.to($gnbFixedArea, 0.2, {top:headerH});
                    gnbFold = false;
                  }
                }else{
                  if(gnbFold === false){
                    TweenMax.killTweensOf($header);
                    //TweenMax.killTweensOf($gnbFixedArea);
                    $gnbFixedArea.addClass("fixed");
                    TweenMax.to($header, 0.2, {top:-(headerH), onComplete:function(){
                      TweenMax.set($header, {display:"none"});
                    }});
                    TweenMax.to($gnbFixedArea, 0.2, {top:0});
                    gnbFold = true;
                  }
                }
             // }
            }else{
              if($gnbFixedArea.hasClass("fixed")){		// 필터 제자리
                if(noFixedCallback != null){
                  noFixedCallback();
                }
              	TweenMax.set($gnbFixedArea, {clearProps:"all"});
                $gnbFixedArea.removeClass("fixed");
                TweenMax.set($header, {display:"block"});
                TweenMax.to($header, 0.2, {top:0});
                gnbFold = false;
              }
            }
            
            prevSTop = sTop;
          });
        }

        // depth2 노출
        $depth1.find(">a").mouseenter(function(){
          if($(this).siblings(".hs-menu-children-wrapper").find(">ul>li").length === 0){
            if($this.timer != null) clearTimeout($this.timer);
            $this.hideFunc();
          }else{
            $this.show($(this));
          }
        });

        // header 닫기
        $header.on({
        	"mouseenter":function(){
            if($this.timer != null) clearTimeout($this.timer);
          },
          "mouseleave":function(){
            $this.hide();
          }
        });
        /*$header.mouseleave(function(){
          $this.hide();
        });*/
      },
      show:function(ele){
        var $this = this,
            $ele = ele,
            $depth1 = this.$depth1,
            $prevLi = $gnb.find(".hs-menu-depth-1").eq($this.prevIndex),
            $submenu = $ele.siblings(".hs-menu-children-wrapper"),
            $bg = $header.find(".bg");
        var headerH = 294,
            depth2Length = $submenu.find(">ul>li").length;
				
        // header open 모션
        if(!$header.hasClass("open")){
          $header.addClass("open");
          TweenMax.killTweensOf($header);
          $this.gnbReady = false;
        }
				
        /*TweenMax.set($bg, {"display":"block"});
        TweenMax.to($bg, 0.3, {"autoAlpha":1, ease:"Power3.easeOut"});*/
        TweenMax.set($bg, {"display":"block", "autoAlpha":1});
        
        // .bg 에 data-menu 개수
        $bg.attr("data-menu", depth2Length);

        // gnb 펼침
        if($this.timer != null) clearTimeout($this.timer);
        if($ele.parent().index() != $this.prevIndex || $this.prevIndex === null) {
          $prevLi.removeClass("on");
          TweenMax.killTweensOf($prevLi.find(".hs-menu-children-wrapper"));
          TweenMax.set($prevLi.find(".hs-menu-children-wrapper"), {"clearProps":"all"});

          $ele.parent().addClass("on");
          TweenMax.killTweensOf($submenu);
          TweenMax.set($submenu, {"display":"block", "autoAlpha":1});
          //TweenMax.to($submenu, 0.6, {"display":"block", "autoAlpha":1, ease:"Cubic.easeOut"});
        }
        $this.prevIndex = $ele.parent().index();
      },
      hide:function(){
        var $this = this;
				
        if(!$header.hasClass("open")) return;
        $this.timer = setTimeout(function(){
          $this.hideFunc();
        }, $this.t);
      },
      hideFunc:function(){					// 실제 gnb 닫는 기능
        var $this = this,
            $submenu = $gnb.find(".hs-menu-children-wrapper"),
            $bg = $header.find(".bg");
        
      	$header.removeClass("open");
        $gnb.find(".hs-menu-depth-1").removeClass("on");
        //TweenMax.set($header, {"clearProps":"all"});
        TweenMax.set($submenu, {"clearProps":"all"});
        TweenMax.set($bg, {"clearProps":"all"});
       /*TweenMax.to($bg, 0.2, {"autoAlpha":0, ease:"Power3.easeOut", onComplete:function(){
       	TweenMax.set($bg, {"clearProps":"all"});
       }});*/
      
        $this.prevIndex = null;
      }
    };

    var _mobileGnb = {
      init:function(){
        //if(device === "desktop") return;
        
        var $this = this;
        
        // mGnb Open/Close
        $btnHam.click(function(e){
          e.preventDefault();
          if($(this).attr("data-open") === "true"){        // mGnb open 되었을 때
            $this.hide();
          }else{                                            // mGnb close 되었을 때
            $this.show();
          }
        });
        
        // depth1 click
        $mGnb.find(".hs-menu-depth-1>a").click(function(e){
          if($(this).siblings().length > 0){
            e.preventDefault();
            
            if($(this).parent().hasClass("on")){      // depth2 open 되어있을 때
              $this.depth2Close($(this).parent());
            }else{
              $this.depth2Close($mGnb.find(".hs-menu-depth-1.on"));
              $this.depth2Open($(this).parent());
            }
          }
        });
      },
      show: function(){
        //$mGnb.slideDown(300);
        var $this = this;
        TweenMax.set($("body"), {overflow:"hidden"});
        TweenMax.set($header, {overflow:"inherit"});
        TweenMax.set($mGnb, {display:"block", x:"-100%"});
        TweenMax.to($mGnb, 0.6, {x:"0%", ease:"Expo.easeOut"});
        
        /*TweenMax.set($mGnb, {display:"block", y:"-100%"});
        TweenMax.to($mGnb, 0.3, {y:"0%", ease:"Ease.easeInOut"});*/
        
        //TweenMax.to($header, 0.4, {className:"+=open"});
        
        // page numbering 
        $this.currentOpen(depth1Num, depth2Num);
        
        $btnHam.attr("data-open", "true");
      },
      hide: function(){
        //$mGnb.slideUp(300);
        var $this = this;
        
        TweenMax.set($("body"), {overflow:"inherit"});
        TweenMax.to($mGnb, 0.5, {x:"-100%", ease:"Expo.easeOut", onComplete:function(){
          TweenMax.set($mGnb, {display:"none"});
          if(device !== "desktop") TweenMax.set($header, {overflow:"hidden"});
        }});
        
        /*TweenMax.to($mGnb, 0.5, {y:"-100%", ease:"Ease.easeInOut", onComplete:function(){
          TweenMax.set($mGnb, {display:"none"});
        }});*/
        
        //TweenMax.to($header, 0.4, {className:"-=open"});
        
        $btnHam.attr("data-open", "false");
      },
      currentOpen:function(d1, d2){
        $mGnb.find(".hs-menu-depth-1").eq(d1).addClass("on");
        $mGnb.find(".hs-menu-depth-1").eq(d1).find(".hs-menu-children-wrapper").css("display", "block");
        $mGnb.find(".hs-menu-depth-1").eq(d1).find(".hs-menu-children-wrapper li").eq(d2).addClass("on");
      },
      depth2Open:function(ele){
        ele.addClass("on");
        ele.find(".hs-menu-children-wrapper").slideDown(250);
      },
      depth2Close:function(ele){
        ele.removeClass("on");
        ele.find(".hs-menu-children-wrapper").slideUp(250);
      }
    };

    return {
      init:init
    }
  })();
  
  // FOOTER
  app.namespace("footer");
  app.footer = (function(){
    var $footer;
    
    var init = function(){
      $footer = app.mg.footer;
      
      _btnTop();							
      _familysite.init();					
    };
    
    // btn_top
    var _btnTop = function(){
    	var $btnTop = $footer.find(".btn_top");
      
      $btnTop.click(function(e){
      	e.preventDefault();
        
        TweenMax.to($("html, body"), 0.6, {scrollTop:0, ease:"Cubic.easeOut"});
      });
    };
    
    // familysite
    /*var _familysite = function(){
    	var $familySite = $footer.find(".family_site");
      var focusOut = true;
      
      // familysite 클릭
      $familySite.find(">a").click(function(e){
        e.preventDefault();

        if($(this).hasClass("open")){
          $(this).removeClass("open");
          //$(this).siblings("ul").slideUp(200);
          TweenMax.to($(this).siblings("ul"), 0.2, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
          	TweenMax.set($(this).siblings("ul"), {display:"none"});
          }});
        }else{
          $(this).addClass("open");
          //$(this).siblings("ul").slideDown(200);
          TweenMax.set($(this).siblings("ul"), {display:"block"});
          TweenMax.to($(this).siblings("ul"), 0.2, {autoAlpha:1, ease:"Cubic.easeOut"});
        }
        
        focusOut = false;
      });
      
      $familySite.focusout(function(){
        if(focusOut === true) return;
        $familySite.find(">a").removeClass("open");
        TweenMax.to($familySite.find("ul"), 0.2, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
          TweenMax.set($familySite.find("ul"), {display:"none"});
        }});
        focusOut = true;
      });
      
      $familySite.find("li a").on({
        focusin:function(){
          console.log("focusin");
          focusOut = true;
        },
        focusout:function(){
          console.log("focusout");
          focusOut = false;
        }
      });
    };*/
    
    var _familysite = {
      $familysite: null,
      init:function(){
        var _ = this;
        var t;
        _.$familysite = $footer.find(".family_site");
        
        // familysite 클릭
        _.$familysite.find(">a").click(function(e){
          e.preventDefault();
          
          if($(this).hasClass("open")){
            _.hide();
          }else{
            _.show();
          }
        });
        
        _.$familysite.focusout(function(){
          t = setTimeout(function(){_.hide();}, 100);
        });
        
        _.$familysite.find("li a").focusin(function(){
          clearTimeout(t);
        });
      },
      show:function(){
        var _ = this;
        var $fA = _.$familysite.find(">a"),
            $fUl = _.$familysite.find(">ul");
        
        $fA.addClass("open");
        TweenMax.set($fUl, {display:"block"});
        TweenMax.to($fUl, 0.2, {autoAlpha:1, ease:"Cubic.easeOut"});
      },
      hide:function(){
        var _ = this;
        var $fA = _.$familysite.find(">a"),
            $fUl = _.$familysite.find(">ul");
        
        $fA.removeClass("open");
        TweenMax.to($fUl, 0.2, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
          TweenMax.set($fUl, {display:"none"});
        }});
      }
    };
    
    return {
    	init:init
    }
  })();
  
  // 채용프로세스별 기능 네비게이션
  app.namespace("prNavi");
  app.prNavi = (function(){
    var $navi, $mNavi;
    var device, 
        pageUrl,
        depth1Arr = [],
        depth2Arr = [],
        depth1Num, depth2Num;
    
    var init = function(){
      var $header = app.mg.header;
      var $btnHam = $header.find(".btn_ham");
      
      $navi = $("#navi");
      $mNavi = $("#m_navi");
      device = app.mg.device;
      pageUrl = location.href;
      
      $(window).resize(function(){
        device = app.mg.device;
      });
      
      _setting();
      _makeMNavi();       // mobile navi 생성
      
      if(depth1Num === undefined) return;
      _desktopNavi();
      _mobileNavi.init();
      
      // gnb 접음
      var tY, prevTY, sTop, prevSTop, 
          headerH, 
          browserDelta, 
          browserDetect = navigator.userAgent.indexOf("Firefox"),
          gnbFold = false;
      var $target;
      
      $(window).on("scroll DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
        if(device != "desktop" && $btnHam.attr("data-open") === "true") return;
       
        $target = (device === "desktop") ? $navi : $mNavi;
        headerH = $header.height();
        sTop = $(window).scrollTop();

        if(e.type === "touchmove"){
          tY = e.originalEvent.touches[0].clientY;
          if(tY > prevTY){
            browserDelta = 1;
          }else{
            browserDelta = -1;
          } 
          prevTY = tY;
        }else{
          /* mousewheel 브라우저 분기 처리
          if(browserDetect > -1){				// firefox
            browserDelta = e.originalEvent.detail * -1;				// firefox에선 스크롤 올리면 (-), 내리면 (+). wheelDelta랑 맞추기 위해 -1 곱함   
          }else{												// 나머지 브라우저
            browserDelta = e.originalEvent.wheelDelta;
          }*/
        }

        //if(e.type === "mousewheel" || e.type === "DOMMouseScroll" || e.type === "touchmove"){               
        if(e.type === "scroll" || e.type === "DOMMouseScroll" || e.type === "touchmove"){
          if(browserDelta > 0 || sTop < prevSTop){
            if(gnbFold === true){               // gnb 펼침
              TweenMax.killTweensOf($header);
              TweenMax.set($header, {display:"block"});
              TweenMax.to($header, 0.2, {y:0});
              TweenMax.to($target, 0.2, {y:0});
              gnbFold = false;
            }
          }else{
            if(gnbFold === false){
              TweenMax.killTweensOf($header);
              TweenMax.to($header, 0.2, {y:-(headerH), onComplete:function(){
                TweenMax.set($header, {display:"none"});
              }});
              TweenMax.to($target, 0.2, {y:-(headerH)});
              gnbFold = true;
            }
          }
        }

        prevSTop = sTop;
      });
    };
    
    // 초기 세팅
    var _setting = function(){
      $navi.find(".depth1 ul li a").each(function(i){
        var obj = {};
        obj.txt = $(this).text();
        obj.url = $(this).attr("href");
        
        depth1Arr[i] = obj;
      });
      
      $navi.find(".depth2>ul").each(function(i){
        depth2Arr[i] = [];
        $(this).find("li a").each(function(j){
          var obj = {};
          obj.txt = $(this).text();
          obj.url = $(this).attr("href");
          
          depth2Arr[i][j] = obj;
        });
      });
      
      if(depth1Arr.length > 0 && depth2Arr.length > 0){
        depth2Arr.forEach(function(v, i){
          v.forEach(function(w, j){
            if(pageUrl.indexOf(w.url) > -1){
              depth1Num = i;
              depth2Num = j;
            }
          });
        });
      } 
    };
    
    // m_navi 마크업 생성
    var _makeMNavi = function(){
      var html = "";
      html += "<ul class='depth1'>";
      depth2Arr.forEach(function(v, i){
        html += "<li>";
        html += "<a href='#'><strong>" + depth1Arr[i].txt + "</strong></a>";
        html += "<ul class='depth2'>";
        v.forEach(function(w, j){
          html += "<li><a href='" + w.url + "'>" + w.txt + "</a></li>";
        });
        html += "</ul>";
        html += "</li>";
      });
      html += "</ul>";
      
      $mNavi.find(".menu").html(html);
    };
    
    // desktop navi
    var _desktopNavi = function(){
      var $depth1 = $navi.find(".depth1"),
          $depth2 = $navi.find(".depth2"),
          $depth1Ul = $depth1.find(">ul");
      
      $depth1.find(">a strong").text(depth1Arr[depth1Num].txt);
      $depth1Ul.find("li").eq(depth1Num).addClass("on");
      $depth2.find(">ul").eq(depth1Num).css("display", "block");
      $depth2.find(">ul").eq(depth1Num).find("li").eq(depth2Num).addClass("on");
      
      $navi.find(".depth1>a").click(function(e){
          e.preventDefault();
        
          if($depth1Ul.attr("data-open") === "open"){
            $depth1Ul.slideUp(300);
            $depth1Ul.attr("data-open", "close");
          }else{
            $depth1Ul.slideDown(300);
            $depth1Ul.attr("data-open", "open");
          }
        });
    };
    
    // tablet, mobile navi
    var _mobileNavi = {
      $current: null,
      $depth1: null,
      $depth2: null,
      init:function(){
        var _ = this,
            depth1Txt = depth1Arr[depth1Num].txt;
        _.$current = $mNavi.find(".current");
        _.$depth1 = $mNavi.find(".depth1");
        _.$depth2 = $mNavi.find(".depth2");
     
        _.depth1Close();
        _.depth1Open(depth1Num);
        _.$depth1.find(">li").eq(depth1Num).find(".depth2 li").eq(depth2Num).addClass("on");
        _.$current.find("a").text(depth1Txt);
        
        // navi 펼치기
        _.$current.find("a").click(function(e){
          e.preventDefault();
          
          if($mNavi.attr("data-open") === "open"){
            $mNavi.attr("data-open", "close");
            _.$current.find("a").text(depth1Txt);
            
            TweenMax.set($("body"), {overflow:"inherit"});
            TweenMax.to(_.$current.find("a"), 0.3, {background:"#121117", ease:"Quad.easeOut"});
            //TweenMax.to($mNavi, 0.4, {height:_.$current.height(), ease:"Expo.easeOut"});
            TweenMax.to($mNavi, 0.4, {height:"4.5rem", ease:"Expo.easeOut"});
          }else{
            $mNavi.attr("data-open", "open");
            _.$current.find("a").text("채용 프로세스별 기능");
            
            TweenMax.set($("body"), {overflow:"hidden"});
            TweenMax.to(_.$current.find("a"), 0.3, {background:"#444", ease:"Quad.easeOut"});
            TweenMax.to($mNavi, 0.4, {height:"100%", ease:"Expo.easeOut"});
          }
        });
        
        // depth2 펼치기
        _.$depth1.find(">li>a").click(function(e){
          e.preventDefault();
          
          if($(this).parent().hasClass("open")){
            _.depth1Close();
          }else{
            _.depth1Close();
            _.depth1Open($(this).parent().index()); 
          }
        });
      },
      depth1Open:function(i){
        var _ = this;
        var $target = _.$depth1.find(">li").eq(i);
        $target.addClass("open");
        $target.find(".depth2").slideDown(200);
      },
      depth1Close:function(){
        var _ = this;
        var $target = _.$depth1.find(">li.open");
        $target.removeClass("open");
        $target.find(".depth2").slideUp(200);
      }
      
    };
    
    return {
      init:init
    }
  })();
  
  // 평가프로세스별 기능 네비게이션
  app.namespace("prHrnavi");
  app.prHrnavi = (function(){
    var $hrnavi, $mHrnavi;
    var device, 
        pageUrl,
        depth1Arr = [],
        depth2Arr = [],
        depth1Num, depth2Num;
    
    var init = function(){
      var $header = app.mg.header;
      var $btnHam = $header.find(".btn_ham");
      
      $hrnavi = $("#hrnavi");
      $mHrnavi = $("#m_hrnavi");
      device = app.mg.device;
      pageUrl = location.href;
      
      $(window).resize(function(){
        device = app.mg.device;
      });
      
      _setting();
      _makeMHrnavi();       // mobile hrnavi 생성
      
      if(depth1Num === undefined) return;
      _desktopHrnavi();
      _mobileHrnavi.init();
      
      // gnb 접음
      var tY, prevTY, sTop, prevSTop, 
          headerH, 
          browserDelta, 
          browserDetect = hrnavigator.userAgent.indexOf("Firefox"),
          gnbFold = false;
      var $target;
      
      $(window).on("scroll DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
        if(device != "desktop" && $btnHam.attr("data-open") === "true") return;
       
        $target = (device === "desktop") ? $hrnavi : $mHrnavi;
        headerH = $header.height();
        sTop = $(window).scrollTop();

        if(e.type === "touchmove"){
          tY = e.originalEvent.touches[0].clientY;
          if(tY > prevTY){
            browserDelta = 1;
          }else{
            browserDelta = -1;
          } 
          prevTY = tY;
        }else{
          /* mousewheel 브라우저 분기 처리
          if(browserDetect > -1){				// firefox
            browserDelta = e.originalEvent.detail * -1;				// firefox에선 스크롤 올리면 (-), 내리면 (+). wheelDelta랑 맞추기 위해 -1 곱함   
          }else{												// 나머지 브라우저
            browserDelta = e.originalEvent.wheelDelta;
          }*/
        }

        //if(e.type === "mousewheel" || e.type === "DOMMouseScroll" || e.type === "touchmove"){               
        if(e.type === "scroll" || e.type === "DOMMouseScroll" || e.type === "touchmove"){
          if(browserDelta > 0 || sTop < prevSTop){
            if(gnbFold === true){               // gnb 펼침
              TweenMax.killTweensOf($header);
              TweenMax.set($header, {display:"block"});
              TweenMax.to($header, 0.2, {y:0});
              TweenMax.to($target, 0.2, {y:0});
              gnbFold = false;
            }
          }else{
            if(gnbFold === false){
              TweenMax.killTweensOf($header);
              TweenMax.to($header, 0.2, {y:-(headerH), onComplete:function(){
                TweenMax.set($header, {display:"none"});
              }});
              TweenMax.to($target, 0.2, {y:-(headerH)});
              gnbFold = true;
            }
          }
        }

        prevSTop = sTop;
      });
    };
    
    // 초기 세팅
    var _setting = function(){
      $hrnavi.find(".depth1 ul li a").each(function(i){
        var obj = {};
        obj.txt = $(this).text();
        obj.url = $(this).attr("href");
        
        depth1Arr[i] = obj;
      });
      
      $hrnavi.find(".depth2>ul").each(function(i){
        depth2Arr[i] = [];
        $(this).find("li a").each(function(j){
          var obj = {};
          obj.txt = $(this).text();
          obj.url = $(this).attr("href");
          
          depth2Arr[i][j] = obj;
        });
      });
      
      if(depth1Arr.length > 0 && depth2Arr.length > 0){
        depth2Arr.forEach(function(v, i){
          v.forEach(function(w, j){
            if(pageUrl.indexOf(w.url) > -1){
              depth1Num = i;
              depth2Num = j;
            }
          });
        });
      } 
    };
    
    // m_hrnavi 마크업 생성
    var _makeMHrnavi = function(){
      var html = "";
      html += "<ul class='depth1'>";
      depth2Arr.forEach(function(v, i){
        html += "<li>";
        html += "<a href='#'><strong>" + depth1Arr[i].txt + "</strong></a>";
        html += "<ul class='depth2'>";
        v.forEach(function(w, j){
          html += "<li><a href='" + w.url + "'>" + w.txt + "</a></li>";
        });
        html += "</ul>";
        html += "</li>";
      });
      html += "</ul>";
      
      $mHrnavi.find(".menu").html(html);
    };
    
    // desktop hrnavi
    var _desktopHrnavi = function(){
      var $depth1 = $hrnavi.find(".depth1"),
          $depth2 = $hrnavi.find(".depth2"),
          $depth1Ul = $depth1.find(">ul");
      
      $depth1.find(">a strong").text(depth1Arr[depth1Num].txt);
      $depth1Ul.find("li").eq(depth1Num).addClass("on");
      $depth2.find(">ul").eq(depth1Num).css("display", "block");
      $depth2.find(">ul").eq(depth1Num).find("li").eq(depth2Num).addClass("on");
      
      $hrnavi.find(".depth1>a").click(function(e){
          e.preventDefault();
        
          if($depth1Ul.attr("data-open") === "open"){
            $depth1Ul.slideUp(300);
            $depth1Ul.attr("data-open", "close");
          }else{
            $depth1Ul.slideDown(300);
            $depth1Ul.attr("data-open", "open");
          }
        });
    };
    
    // tablet, mobile hrnavi
    var _mobileHrnavi = {
      $current: null,
      $depth1: null,
      $depth2: null,
      init:function(){
        var _ = this,
            depth1Txt = depth1Arr[depth1Num].txt;
        _.$current = $mHrnavi.find(".current");
        _.$depth1 = $mHrnavi.find(".depth1");
        _.$depth2 = $mHrnavi.find(".depth2");
     
        _.depth1Close();
        _.depth1Open(depth1Num);
        _.$depth1.find(">li").eq(depth1Num).find(".depth2 li").eq(depth2Num).addClass("on");
        _.$current.find("a").text(depth1Txt);
        
        // hrnavi 펼치기
        _.$current.find("a").click(function(e){
          e.preventDefault();
          
          if($mHrnavi.attr("data-open") === "open"){
            $mHrnavi.attr("data-open", "close");
            _.$current.find("a").text(depth1Txt);
            
            TweenMax.set($("body"), {overflow:"inherit"});
            TweenMax.to(_.$current.find("a"), 0.3, {background:"#121117", ease:"Quad.easeOut"});
            //TweenMax.to($mHrnavi, 0.4, {height:_.$current.height(), ease:"Expo.easeOut"});
            TweenMax.to($mHrnavi, 0.4, {height:"4.5rem", ease:"Expo.easeOut"});
          }else{
            $mHrnavi.attr("data-open", "open");
            _.$current.find("a").text("채용 프로세스별 기능");
            
            TweenMax.set($("body"), {overflow:"hidden"});
            TweenMax.to(_.$current.find("a"), 0.3, {background:"#444", ease:"Quad.easeOut"});
            TweenMax.to($mHrnavi, 0.4, {height:"100%", ease:"Expo.easeOut"});
          }
        });
        
        // depth2 펼치기
        _.$depth1.find(">li>a").click(function(e){
          e.preventDefault();
          
          if($(this).parent().hasClass("open")){
            _.depth1Close();
          }else{
            _.depth1Close();
            _.depth1Open($(this).parent().index()); 
          }
        });
      },
      depth1Open:function(i){
        var _ = this;
        var $target = _.$depth1.find(">li").eq(i);
        $target.addClass("open");
        $target.find(".depth2").slideDown(200);
      },
      depth1Close:function(){
        var _ = this;
        var $target = _.$depth1.find(">li.open");
        $target.removeClass("open");
        $target.find(".depth2").slideUp(200);
      }
      
    };
    
    return {
      init:init
    }
  })();
  
  // inAIR 소개 - AI 면접
  app.namespace("inairAI");
  app.inairAI = (function(){    
    // 반응형 분기 처리
    var responsive = (function(){
      var $introVideo, $introFigure, $introLight, $processDark, $p6Video, $logoArea;
      var device, prevDevice, browser;
      
      var src = {
        introVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/start.mp4",
        introIEVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/inAIR_ex_2.mp4",
        dashboardImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/dashboard_img.jpg",
        introLightVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/light3.mp4",
        darkImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/process_large_dark.jpg",
        darkMImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/process_large_dark.jpg",
        p6Video: "https://fs.hubspotusercontent00.net/hubfs/4570750/inAIR/video/renewal/p6.mp4",
        p6MVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/p6_mobile2.mp4",
        logoImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/story_logo.jpg",
        logoMImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/story_logo.jpg"
      };
      
      var init = function(){
        device = app.mg.device;
        browser = app.mg.browser;
        $introVideo = $(".intro_area .video_area");
        $introFigure = $(".intro_area .text_area figure");
        $introLight = $(".intro_area .light_m");
        $processDark = $(".process_intro .dark");
        $p6Video = $(".p6_area video");
        $logoArea = $(".customer_area .logo_area");
        
        _setting();
        
        $(window).resize(function(){
          prevDevice = device;
          device = app.mg.device;
          browser = app.mg.browser;
          
          if(device !== prevDevice) _setting();
        });
        
        prevDevice = device;
      };
      
      var _setting = function(){
        if(device === "desktop"){
          _desktop();
        }else{
          _mobile();
        }
      };
      
      var _desktop = function(){
        if(browser === "IE"){
          $introVideo.find("video").attr("src", src.introIEVideo);
        }else{
          $introVideo.find("video").attr("src", src.introVideo);
        }
        $processDark.html("<img src='"+src.darkImg+"' alt=''>");
        $p6Video.attr("src", src.p6Video);
        $logoArea.html("<img src='"+src.logoImg+"' alt=''>");
      };
      
      var _mobile = function(){
        if(device === "tablet"){
          $processDark.html("<img src='"+src.darkImg+"' alt=''>");
          $p6Video.attr("src", src.p6Video);
        }else{
          $processDark.html("<img src='"+src.darkMImg+"' alt=''>");
          $p6Video.attr("src", src.p6MVideo);
        }
        $introFigure.html("<img src='"+src.dashboardImg+"' alt=''>");
        $introLight.find("video").attr("src", src.introLightVideo);
        $logoArea.html("<img src='"+src.logoMImg+"' alt=''>");
      };
      
      return{
        init:init
      }
    })();
    
    // gnb 
    var gnbControl = (function(){
      var $header;
      var device,
          browserDetect,
          headerH,
          headerFold = true,
          headerStart = 0,            // header 노출 시작 영역 offsettop 값
          headerChangeColor = 0;      // header 색상 바뀌는 시작 영역 offset top 값
      
      var init = function(){
        $header = app.mg.header;
        device = app.mg.device;
        browserDetect = navigator.userAgent.indexOf("Firefox");
        
        _setting();
        _scroll();
        
        $(window).resize(function(){
          _setting();                 
        });
      };
      
      var _setting = function(){
        device = app.mg.device;
        headerH = $header.height();
        headerStart = $(".process_intro").offset().top - 120;
        headerChangeColor = $(".p6_area").offset().top;
      };
      
      var _scroll = function(){
        var tY, prevTY, sTop, prevSTop, browserDelta;

        $(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
          sTop = $(window).scrollTop();

          // mousewheel 브라우저 분기 처리
          /*if(e.type === "touchmove"){
            tY = e.originalEvent.touches[0].clientY;
            if(tY > prevTY){
              browserDelta = 1;
            }else{
              browserDelta = -1;
            } 
            prevTY = tY;
          }else{
            if(browserDetect > -1){				// firefox
              browserDelta = e.originalEvent.detail * -1;				// firefox에선 스크롤 올리면 (-), 내리면 (+). wheelDelta랑 맞추기 위해 -1 곱함   
            }else{												// 나머지 브라우저
              browserDelta = e.originalEvent.wheelDelta;
            }
          }*/

          // mousewheel로 gnb 접고 펼침
          if(headerStart <= sTop){
            // header 색상 교체
            if(sTop < headerChangeColor){
              $("body").addClass("header_black");
            }else{
               $("body").removeClass("header_black");
            }
            
            // header 접고 펼침
            if(device === "desktop"){                      // desktop 일 때
              if(headerFold === true){  
                _headerShow();
              }
            }else{                                        // tablet, mobile 일 때
              _headerFix();
            }
            
            /*if(e.type === "mousewheel" || e.type === "DOMMouseScroll" || e.type === "touchmove"){               
              if(device === "desktop"){                      // desktop 일 때
                if(browserDelta > 0){                       // header 펼침
                  if(headerFold === true){  
                    _headerShow();
                  }
                }else{                                     // header 접음
                  if(headerFold === false){
                    _headerHide();
                  }
                }
              }else{                                        // tablet, mobile 일 때
                _headerFix();
              }
            }*/
          }else{
            if(device === "desktop"){
              _headerHide();
            }else{
              _headerMHide();
            }
          }
          
          prevSTop = sTop;
        });
      };
      
      // desktop - header 펼침
      var _headerShow = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", y:-(headerH)});
        TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
        headerFold = false;
      };
      
      // desktop - header 접음
      var _headerHide = function(){
        TweenMax.killTweensOf($header);
        TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
          TweenMax.set($header, {display:"none"});
        }});
        headerFold = true;
      };
      
      // tablet, mobile - header 노출 및 고정
      var _headerFix = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", position:"fixed", y:0});
        headerFold = false;
      }; 
      
      // tablet, mobile - header 숨김
      var _headerMHide = function(){
        TweenMax.killTweensOf($header);
        //TweenMax.set($header, {display:"none", position:"absolute"});
        TweenMax.set($header, {display:"none"});
        headerFold = true;
      };
      
      return {
        init:init
      }
    })();
    
    
    // 노트북 모션
    var canvas = (function(){
      var $introArea, $titleArea, $textArea, $canvas, ctx, $scrollDown;
      var canvasInfo = {w:0, h:0},          // canvas 정보 obj 
          opt = {},
          imgArr= [],                                     // img 객체 담을 array
          autoArr = [],                                   // 스크롤 자동 재생 이미지 array
          imgInfo = {w:0, h:0, x:0, y:0},     // img 정보 obj
          introAreaOffTop = 0,                // .intro_area offsetTop
          introAreaH = 0,                     // .intro_area 높이
          curNum = 0,                          // 현재 img seq num
          scrollStatus = {first:true, show:false},   // scroll down 노출 정보 - 처음 로딩된 후 한번만 노출시킴
          device, prevDevice,
          sStart = 0, sEnd = 0, duration = 0,
          winH,
          mReady = true;

      var defaultOption = {
        frame: 0,       // frame 수
        introEndSeq: 0, // intro 영상 대신 시퀀스 재생끝나는 마지막 인덱스
        imgDir: null,
        imgFormat: ".jpg",
        bgColor: "#000",
        imgW: 0,          // 리사이징되어야 할 이미지 너비
        imgH: 0
      };

      var init = function(option){   
        $introArea = $(".intro_area");
        $titleArea = $introArea.find(".title_area");
        $textArea = $introArea.find("ㅇ.text_area");
        $canvas = document.getElementById("notebook");
        $scrollDown = $introArea.find(".scroll_down");
        ctx = $canvas.getContext("2d");
        opt = $.extend(defaultOption, option, {});
        device = app.mg.device;
        winH = $(window).height();

        var num = 0;
        var loadImgs = 0;
        
        // img arr setting
        /*for(var i = 0; i < opt.frame; i++){
          var img = new Image();
          num = i + option.introEndSeq + 1;
          //num = i;
          img.src = opt.imgDir + "a_" +  num + opt.imgFormat;   
          imgArr.push(img); 
        }*/
        
        if(device === "desktop"){
          _setting();
          _playVideo();       // 노트북 시퀀스 재생
          _scrollImg();       // 스크롤 시퀀스 재생
          _scrollTop();       // scroll Top
          setTimeout(function(){
            _scrollDown("show");
          }, 2200);
        }else{
          _mobileMotion();    // mobile motion
        }

        // 리사이징 되면 canvas 다시 그리기
        $(window).resize(function(){
          device = app.mg.device;
          winH = $(window).height();
          
          if(device === "desktop"){
            _setting();
            //console.log("확인");
            _drawImage(imgArr[curNum], imgInfo.x, imgInfo.y, imgInfo.w, imgInfo.h);
            _stopVideo();
            _scrollImg();       // 스크롤 시퀀스 재생
            //_scrollTop();       // scroll Top
          }else{
            if(device === prevDevice) return;
            _mobileMotion();
          }
          
          prevDevice = device;
        });
      };

      // canvas, img 정보 setting
      var _setting = function(){
        if(imgArr.length <= 0){
          // img arr setting
          for(var i = 0; i < opt.frame; i++){
            var img = new Image();
            num = i + opt.introEndSeq + 1;
            //num = i;
            img.src = opt.imgDir + "a_" +  num + opt.imgFormat;   
            imgArr.push(img); 
          }
        }

        $canvas = document.getElementById("notebook");
        $canvas.width = 1920;
        $canvas.height = 1080;
        canvasInfo.w = $canvas.width;
        canvasInfo.h = $canvas.height;
        imgInfo.w = 1920;
        imgInfo.h = 1080;
        imgInfo.x = 0;
        imgInfo.y = 0;

        introAreaOffTop = $introArea.offset().top;
        introAreaH = $introArea.height();     
        duration = winH;
        sStart = introAreaOffTop;
        sEnd = introAreaOffTop + introAreaH - duration;
        maxRate = (sEnd - sStart) / introAreaH;    
      };

      // ctx 그리기 
      var _drawScreen = function(){
        ctx.fillStyle = opt.bgColor;
        ctx.fillRect(0, 0, canvasInfo.w, canvasInfo.h);
      };

      // 이미지 그리기
      var _drawImage = function(img, x, y, w, h){
        _drawScreen();
        ctx.drawImage(img, x, y, w, h);
      };

      // 이미지 크롭시켜서 그리기
      var _drawCropImage = function(img, sx, sy, sw, sh, x, y, w, h){
        if(app.mg.device !== "desktop") return;
        
        _drawScreen();
        //console.log(img, sx, sy, sw, sh, x, y, w, h)
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      };

      // scroll 막기
      var _scrollStop = function(){
        $("html, body").on("scroll touchmove mousewheel", function(e){
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
      };

      // scroll 활성화
      var _scrollStart = function(){
        $("html, body").off("scroll touchmove mousewheel");
      };
      
      // scroll Top으로 보내기
      var _scrollTop = function(){
        if(device !== "desktop") return;
        
        if($(window).scrollTop() != 0) TweenMax.to($("html, body"), 0.3, {scrollTop:0});
      };

      // 노트북 시퀀스 재생
      var _playVideo = function(){
        var $videoArea = $introArea.find(".video_area"),
            $video = document.getElementById("notebook_start");
        var curTime = 0;

        _scrollStop();
        _videoSizeChange();
        $video.play();

        var t = setInterval(function(){
          curTime += 0.1;
          
          if(curTime >= 2.7){
            clearInterval(t);              
            _scrollStart();
            //_autoSeq();
            TweenMax.set($videoArea, {display:"none"});
            return;
          }
        }, 100);

        function _videoSizeChange(){          
          $($video).css({"width":imgInfo.w, "height":imgInfo.h, "marginTop":imgInfo.y, "marginLeft":imgInfo.x});
        }
      };
      
      var _stopVideo = function(){
        var $videoArea = $introArea.find(".video_area"),
            $video = document.getElementById("notebook_start");
        
        $video.pause();
        $videoArea.css("display", "none");
      };

      // 노트북 opacity 자동 모션
      /*var _autoSeq = function(){
        var cnt = 0;
        console.log("auto");

        var ta = setInterval(function(){
          if(cnt === 10){
            clearInterval(ta);
            _scrollStart();
            _scrollImg();       // 스크롤 시퀀스 재생
            return;
          }
          _drawImage(autoArr[cnt], imgInfo.x, imgInfo.y, imgInfo.w, imgInfo.h);
          cnt++;            
        }, 50);
      };*/

      // 스크롤 시퀀스
      var _scrollImg = function(){
        var scrollRate = 0,             // $introArea에서 스크롤 진행율
            maxRate = 0,                // notebook 영역에서 움직일 수 있는 스크롤 최대 비율
            nb = {},                    // notebook seq obj     
            minCnt = 0,                   // img start index
            maxCnt = opt.frame - 1,           // img end index
            sTop = 0, prevSTop=0, 
            textAreaShow = false;
        
        nb.endPer = 1.0;
        nb.rate = 0;                      // notebook seq 스크롤 진행율

        // img 로드된 후에 측정가능
        imgArr[minCnt].onload = function(){
          _drawImage(imgArr[minCnt], imgInfo.x, imgInfo.y, imgInfo.w, imgInfo.h);
        };

        window.addEventListener("scroll", _onScroll, {passive:true});

        function _onScroll(e){
          if(device !== "desktop") return;

          sTop = window.scrollY;
          scrollRate = (sTop-sStart) / (sEnd - sStart);

          if(sTop >= sStart && sTop <= sEnd){
            mReady = true;
          }else{
            mReady = false;
            _scrollDown("hide");
            TweenMax.set($scrollDown, {position:"absolute"});
            TweenMax.set($textArea, {position:"absolute"});
            scrollStatus.first = false;
          }

          requestAnimationFrame(function(){
            if(!mReady) return;

            if(prevSTop <= sTop){         // scroll Down
              if(prevSTop === 0){
                TweenMax.to($titleArea, 0.4, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
                  TweenMax.set($titleArea, {display:"none"});
                }});
              }
              _motionNotebook("down");
            }else{                        // scroll Up
              if(sTop === 0){
                TweenMax.set($titleArea, {display:"block"});
                TweenMax.to($titleArea, 0.4, {autoAlpha:1, ease:"Cubic.easeOut"});
              } 
              _motionNotebook("up");
            }

            prevSTop = sTop;
          });
        }

        // 스크롤 진행율 계산
        function _calRate(v){     // r: rate obj, v: rate value
          var result = 0;

          if(v < 0){
            result = 0;
          }else if(v > 1){
            result = 1;
          }else{
            result = v;
          }

          return result;
        } 

        // 노트북 시퀀스 모션
        function _motionNotebook(dir){
          if(scrollRate <= nb.endPer){
            nb.h = introAreaH * nb.endPer;    // notebook 모션 높이
            //nb.rate = _calRate((sTop-introAreaOffTop)/nb.h);
            nb.rate = scrollRate;
            
            if(dir === "down"){         // scroll down
              var num = minCnt + Math.floor((maxCnt - minCnt)*nb.rate);
              num = num > maxCnt ? maxCnt : num; 
              
              if(num < 10) _scrollDown("hide");
              if(num <= 202){           // canvas 위치 세로 가운데로 이동하기
                var n = num / 202;
                var y = -1 * (38 + 12.1 * n);
                TweenMax.set($canvas, {y:y+"%"});
              }

              if(num >= 300){                 // 섬광 위 텍스트 띄우기
                if(!textAreaShow){
                  TweenMax.set($textArea, {display:"block", autoAlpha:0, position:"fixed"});
                  TweenMax.to($textArea, 0.6, {autoAlpha:1, ease:"Cubic.easeOut"});
                  textAreaShow = true;
                  _scrollDown("show");
                }
              }else{
                TweenMax.set($textArea, {display:"none"});
              }

              //console.log(num, imgArr[num]);
              _drawImage(imgArr[num], imgInfo.x, imgInfo.y, imgInfo.w, imgInfo.h);
              curNum = num;
            }else{                      // scroll up
              var num = maxCnt - Math.floor((maxCnt - minCnt)*(1-nb.rate));
              num = num < minCnt ? minCnt : num; 

              if(num <= 201){
                var n = num / 201;
                var y = -1 * (38 + 12.1 * n);
                TweenMax.set($canvas, {y:y+"%"});
              }

              if(num >= 300){
                if(textAreaShow){
                  TweenMax.to($textArea, 0.6, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
                    TweenMax.set($textArea, {clearProps:"all"});
                  }});
                  _scrollDown("hide");
                  scrollStatus.first = false;
                  textAreaShow = false;
                }
              }else{
                TweenMax.set($textArea, {display:"none"});
              }

              _drawImage(imgArr[num], imgInfo.x, imgInfo.y, imgInfo.w, imgInfo.h);
              curNum = num;
            }
          }else{}
        }
      };
      
      // scroll down show-hide
      var _scrollDown = function(type){
        if(type === "show"){              // scroll down 노출
          if(scrollStatus.show != false || scrollStatus.first != true) return;
          
          TweenMax.killTweensOf($scrollDown);
          TweenMax.set($scrollDown, {display:"block", autoAlpha:0});
          TweenMax.to($scrollDown, 0.6, {autoAlpha:1, ease:"Quad.easeOut"});

          scrollStatus.show = true;
          //scrollStatus.first = false;
        }else{                              // scroll down 숨김
          if(scrollStatus.show === false) return;

          TweenMax.killTweensOf($scrollDown);
          TweenMax.to($scrollDown, 0.5, {autoAlpha:0, ease:"Expo.easeOut", onComplete:function(){
            TweenMax.set($scrollDown, {display:"none"});
          }});          
          scrollStatus.show = false;
        }
      };
      
      // mobile motion
      var _mobileMotion = function(){
        var $tp = $textArea.find("p"),
            $tStrong = $tp.find("strong"),
            $tLightM = $tp.find(".light_m");
        var taOffTop = $textArea.offset().top,
            tpOffTop = $tp.offset().top - $(window).width(),      // 100vw 빼기
            tpH = $tp.innerHeight(),
            tpEnd = tpOffTop + tpH,
            tpMotion = true,
            sTop, prevSTop, dir;
        
        TweenMax.killTweensOf($titleArea);
        TweenMax.killTweensOf($textArea);
    
        $(window).scroll(function(){
          if(device == "desktop") return;
          sTop = $(window).scrollTop();
          if(sTop <= taOffTop){
            distance = (sTop - prevSTop) < 0 ? prevSTop : sTop;
            //TweenMax.to($titleArea, 0.01, {y:distance*0.2});
            TweenMax.to($titleArea.siblings(".mask"), 0.3, {autoAlpha:0.9*distance/taOffTop});
            prevSTop = sTop;
          }else if(tpOffTop <= sTop && sTop <= tpEnd){
            if(!tpMotion) return;
            
            TweenMax.set($tStrong, {display:"block", y:80});
            TweenMax.to($tLightM, 0.6, {autoAlpha:0.5, ease:"Quad.easeIn"});
            TweenMax.to($tStrong, 1.5, {y:0, ease:"Expo.easeOut", delay:0.3});
            TweenMax.to($tStrong, 1.2, {autoAlpha:1, ease:"Quad.easeOut", delay:0.5});
            tpMotion = false;
          }else{}
        });
      };  

      return{
        init:init
      }
    })();
    
    // IE 노트북
    var canvasIE = (function(){
      var $introArea, $titleWrap, $titleArea, $videoArea, $videoIE, $scrollDown;
      var vDuration,                    // video 총 길이
          txtEndTime = 1.5,            // txt 모션 끝나는 시간
          moveTime = 2;              // 노트북 중간위치까지 올리는 시간  2초-1초
       
      var init = function(){
        $introArea = $(".intro_area");
        $titleWrap = $introArea.find(".title_wrap");
        $titleArea = $introArea.find(".title_area");
        $videoArea = $introArea.find(".video_area");
        $videoIE = $introArea.find("video");
        $scrollDown = $introArea.find(".scroll_down");
        vDuration = $videoIE[0].duration;
        
        /*TweenMax.set($titleArea.find("p"), {display:"block", autoAlpha:0});
        TweenMax.set($titleArea.find("h2"), {display:"block", autoAlpha:0});
        TweenMax.to($titleArea.find("p"), 0.8, {autoAlpha:1, ease:"Quad.easeInOut", delay:0.3});
        TweenMax.to($titleArea.find("h2"), 0.8, {autoAlpha:1, ease:"Quad.easeInOut", delay:0.5});*/
        TweenMax.set($titleArea, {display:"block"});
        TweenMax.to($titleArea, 1.0, {autoAlpha:1, ease:"Quad.easeOut", delay:0.4});
        TweenMax.to($titleArea, 1.0, {autoAlpha:0, ease:"Expo.easeOut", delay:1.5});
        TweenMax.to($titleWrap.find(".ie.top"), 0.8, {height:0, ease:"Quint.easeInOut", delay:1.6});
        TweenMax.to($titleWrap.find(".ie.bottom"), 0.8, {height:0, ease:"Quint.easeInOut", delay:1.6});
        setTimeout(function(){_playVideo();}, 2200);
        
        
        var sTop, prevSTop;
        $(window).on("scroll wheel mousewheel DOMMouseScroll", function(){
          sTop = $(window).scrollTop();
          
          if(sTop === 0 && sTop<prevSTop){
            if($videoIE[0].currentTime >= vDuration){
              TweenMax.set($videoArea, {display:"none"});
              TweenMax.to($scrollDown, 0.4, {autoAlpha:0, ease:"Quad.easeOut", onComplete:function(){
                TweenMax.set($scrollDown, {display:"none"});
              }});
              _playVideo();
            }
          }
          prevSTop = sTop;
        });
      };
      
      var _playVideo = function(){
        TweenMax.set($videoArea, {display:"block"});
        $videoIE[0].play();
        setTimeout(function(){
          TweenMax.set($scrollDown, {display:"block"});
          TweenMax.to($scrollDown, 0.6, {autoAlpha:1, ease:"Quad.easeOut"});
        }, 6000);
      };
      
      /*var init = function(){
        $introArea = $(".intro_area");
        $titleArea = $introArea.find(".title_area");
        $videoArea = $(".intro_area").find(".video_area");
        $videoIE = $("video.ie");
        vDuration = $videoIE[0].duration;
        
        _playVideo();
        
        var sTop, prevSTop;
        $(window).on("scroll wheel mousewheel DOMMouseScroll", function(){
          sTop = $(window).scrollTop();
          
          if(sTop === 0 && sTop<prevSTop){
            if($videoIE[0].currentTime >= vDuration){
              _txtMotion("show");
              TweenMax.set($videoArea, {display:"none"});
              _playVideo();
            }
          }
          prevSTop = sTop;
        });
      };
      
      var _playVideo = function(){
        TweenMax.set($videoArea, {display:"block", y:"-38%"});
        $videoIE[0].play();
        setTimeout(function(){
          _txtMotion("hide");
        }, txtEndTime*1000);
      };
      
      var _txtMotion = function(status){
        if(status === "show"){
          TweenMax.set($titleArea, {display:"block", autoAlpha:0});
          TweenMax.to($titleArea, 0.4, {autoAlpha:1, ease:"Quad.easeOut"});
        }else{
          TweenMax.to($titleArea, 0.4, {autoAlpha:0, ease:"Quad.easeOut", onComplete:function(){
            TweenMax.set($titleArea, {display:"none"});
          }});
        }
      };*/
      
      return{
        init:init              
      }                  
    })();
    
    // 뉴스 반응형일 때 슬라이드로 변환
    var newsMobileSlide = (function(){
      var $newsUl;
      var device, prevDevice;
      
      var init = function(){
        $newsUl = $(".news_area ul.slides");
        //device = app.mg.device;
        
        _act();
        $(window).resize(function(){
          _act();
        });
      };
      
      var _act = function(){
        device = app.mg.device;
        if(device != prevDevice) {
          if(device === "mobile"){
            $newsUl.not(".slick-initialized").slick({
              fade:true,
              slidesToShow:1,
              slidesToScroll:1,
              arrows:false,
              dots:true,
              infinite: false,
              autoplay:true,
              autoplaySpeed:3500,
              draggable:false,
              speed:300,
              //cssEase:"cubic-bezier(0.225, 0.625, 0.245, 1.025)",
              cssEase: "ease-out",
              zIndex:80,
              pauseOnHover:false,
              pauseOnFocus:false
            });
          }else{
            if($newsUl.hasClass("slick-initialized")){
              $newsUl.slick("unslick");
            }
          }
        }     
        
        prevDevice = device;
      };
      
      return {
        init:init
      }
    })();
    
    // process 모션 
    var processMotion = (function(){
      var $prList, $imgArea, $txtArea,
          $imgLi, $txtLi, $btnArea, $btnPrev, $btnNext;
      var curIdx = 0, prevIdx,
          tranInfo = [0, 3.6, 7.2, 10.8, 14.4, 18],      // 단위는 vw
          scrollObj = {},
          motionReady = true,       // 첫번째 모션 실행 여부
          imgLiLength = 0;           // 카드간 움직일 거리

      var init = function(){
        $prList = $(".process_list");
        $imgArea = $prList.find(".img_area");
        $imgLi = $imgArea.find("li");
        $txtArea = $prList.find(".txt_area");
        $txtLi = $txtArea.find("li");
        $btnArea = $txtArea.find(".btn_area");
        $btnPrev = $btnArea.find("button.prev");
        $btnNext = $btnArea.find("button.next");
        imgLiLength = $imgLi.length;
        
        tranInfo.forEach(function(v, i){          // vw -> px 
          tranInfo[i] = _vw(v);
        });
        
        if(app.mg.device != "desktop"){
          _mobileMotion();
        }else{
          _setting();
          TweenMax.set($imgLi.eq(0), {x:-50});      // 초기 모션 위해서 좌측으로 땡김
        }
        
        _btnShow();

        $(window).on({
          resize:function(){
            if(app.mg.device != "desktop") return;
            _setting();
          },
          scroll:function(){
            if(app.mg.device != "desktop") return;
            var sTop = $(window).scrollTop();

            if(sTop >= scrollObj.sStart - $(window).height()*0.2 && sTop <= scrollObj.sEnd){
              if(!motionReady) return;
              _desktopMotion();
            }
          }
        });

        $btnArea.find("button").click(function(e){
          e.preventDefault();
          
          // 슬라이드 노출
          if($(this).hasClass("next")){
            _show("next");
          }else{
            _show("prev");
          }
          
          _btnShow();
        });
      };

      var _setting = function(){
        scrollObj = {
          sStart: $prList.offset().top,
          sEnd: $prList.offset().top + $prList.height()
        };
      };
      
      var _btnShow = function(){
        if(app.mg.device === "desktop"){
          TweenMax.to($btnPrev, 0.3, {display:"inline-block", x:0, autoAlpha:1, ease:"Cubic.easeOut"});
          TweenMax.to($btnNext, 0.3, {display:"inline-block", x:0, autoAlpha:1, ease:"Cubic.easeOut"});
        }else{
          if(curIdx === 0){
            TweenMax.to($btnPrev, 0.3, {autoAlpha:0, x:-10, ease:"Cubic.easeOut", onComplete:function(){
              TweenMax.set($btnPrev, {"display":"none"});
            }});
          }else if(curIdx === imgLiLength-1){
            TweenMax.to($btnNext, 0.3, {autoAlpha:0, x:10, ease:"Cubic.easeOut", onComplete:function(){
              TweenMax.set($btnNext, {"display":"none"});
            }});  
          }else{
            TweenMax.to($btnPrev, 0.3, {display:"block", x:0, autoAlpha:1, ease:"Cubic.easeOut"});
            TweenMax.to($btnNext, 0.3, {display:"block", x:0, autoAlpha:1, ease:"Cubic.easeOut"});
          }
        }
      };
      
      // 웹에서 스크롤 도달했을 때 모션
      var _desktopMotion = function(){
        TweenMax.set($btnArea, {display:"block"});

        TweenMax.to($imgLi.eq(0), 0.4, {x:-10, ease:"Expo.easeOut"});
        TweenMax.to($txtLi.eq(0), 0.5, {autoAlpha:1, ease:"Quad.easeOut"});
        TweenMax.to($btnArea, 0.5, {autoAlpha:1, ease:"Quad.easeOut"});

        for(var i=0; i<imgLiLength; i++){
          TweenMax.to($imgLi.eq(i), 0.2, {autoAlpha:1, ease:"Power4.easeOut"});
          TweenMax.to($imgLi.eq(i), 0.3, {x:tranInfo[i], ease:"Expo.easeOut"});
        }

        motionReady = false;
      };
      
      // 태블릿/모바일에서 콘텐츠 모션 없이 노출
      var _mobileMotion = function(){
        TweenMax.set($btnArea, {display:"block", autoAlpha:1});
        TweenMax.set($txtLi.eq(0), {autoAlpha:1});
        for(var i=0; i<imgLiLength; i++){
          TweenMax.set($imgLi.eq(i), {autoAlpha:1, x:tranInfo[i]});
        }
      };

      var _calCur = function(dir){
        prevIdx = curIdx;

        if(dir === "next"){
          //curIdx = curIdx >= $imgLi.length-1 ? 0 : curIdx+1;
          curIdx = curIdx >= $imgLi.length-1 ? $imgLi.length-1 : curIdx+1;
        }else{
          //curIdx = curIdx == 0 ? $imgLi.length-1 : curIdx-1;
          curIdx = curIdx == 0 ? 0 : curIdx-1;
        }
      };

      var _show = function(dir){
        _calCur(dir);
        if(curIdx === prevIdx) return;

        var gap = _vw(1.5);

        TweenMax.to($txtLi.eq(prevIdx), 0.4, {autoAlpha:0});
        TweenMax.to($txtLi.eq(curIdx), 0.4, {autoAlpha:1});

        if(dir === "next"){
          //TweenMax.to($imgArea, 0.4, {x:-1*gap*curIdx, ease:"Power2.easeOut"});
          TweenMax.to($imgArea, 0.4, {x:-1*tranInfo[curIdx]*0.6, ease:"Power3.easeOut"});
          TweenMax.to($imgLi.eq(prevIdx), 0.3, {x:-1*gap+tranInfo[prevIdx], ease:"Quad.easeInOut", delay:0.05});
          TweenMax.to($imgLi.eq(prevIdx), 0.4, {autoAlpha:0, ease:"Cubic.easeOut", delay:0.05});
        }else{
          TweenMax.set($imgLi.eq(curIdx), {autoAlpha:0});

          //TweenMax.to($imgArea, 0.4, {x:gap*(-1*prevIdx+1), ease:"Power2.easeOut"});
          TweenMax.to($imgArea, 0.4, {x:-tranInfo[curIdx]*0.6, ease:"Power3.easeOut"});
          TweenMax.to($imgLi.eq(curIdx), 0.3, {x:tranInfo[curIdx], ease:"Quad.easeOut", delay:0.05});
          TweenMax.to($imgLi.eq(curIdx), 0.4, {autoAlpha:1, ease:"Cubic.easeInOut"});
        }
      };

      var _vw = function(v){
        return v/100 * $(window).width();
      };

      return{
        init:init
      }
    })();
    
    /*
        AI-사람 대화 UI
        array = [{st: start time, rapid: motion rapid (한번 튕길 때 속도), repeat: repeat num (반복수는 문장의 단어 수만큼)}]
     */
    var aiHumanCom = (function(){
        var $comCon, $txtHuman, $txtAi, $aiShape, $circle, $mask;
        var hmArr = [],                         // 사람 멘트 array
            amArr = [],                         // ai 멘트 array
            asArr = [],                         // ai shape 정보 array
            curIdx = 0,                         // 현재 ai-사람 멘트 index
            aihumanDelay = 0.7,                 // ai랑 사람 멘트 사이 딜레이
            nextDelay = 1.4,                    // 다음 멘트세트 시작 딜레이
            device,
            t;


        var init = function(h, a, as){           // 사람멘트, ai멘트, ai shape 모션 정보
          $comCon = $(".com_con");
          $txtHuman = $comCon.find(".txt.human");
          $txtAi = $comCon.find(".txt.ai");
          $aiShape = $comCon.find(".ai_shape");
          $circle = $comCon.find(".circle");
          $mask = $comCon.find(".mask");
          device = app.mg.device;

          hmArr = h;
          amArr = a;
          asArr = as;

          _controlMotion();
          
          $(window).resize(function(){
            device = app.mg.device;
          });
        };

        // 전체 모션 컨트롤
        var _controlMotion = function(){
            if(curIdx >= hmArr.length){
                curIdx = 0;
            }

            _aiTyping(amArr[curIdx]);
            //_humanCom(hmArr[curIdx]);
            _pulseMotion(asArr[curIdx]);
        };

        // ai 타이핑 모션
        var _aiTyping = function(txt){
          var w = 0;

          TweenMax.set($txtAi, {display:"block"});
          TweenMax.to($txtAi, 0.5, {autoAlpha:1, ease:"Cubic.easeOut"});
          
          if(device === "mobile"){
            TweenMax.set($mask, {display:"block", autoAlpha:0});
            TweenMax.to($mask, 0.4, {autoAlpha:0.7, ease:"Quad.easeOut"});
            TweenMax.to($aiShape, 0.3, {autoAlpha:1, ease:"Cubic.easeOut"});
          }else{
            TweenMax.set($mask, {display:"none"});
            TweenMax.set($aiShape, {display:"block", autoAlpha:1});
          }

          KM({
              eleId: "txt_ai",
              letter: new Array(txt),
              letterTime: 0.03,
              letterDelay: 0.06,
              cursorEnd: false,
              callback: function(i, length){
                if($txtAi.find(".letter").eq(i).width() === 0){
                  w += $txtAi.find(".letter").eq(0).width() * 0.5;
                }else{
                  w += $txtAi.find(".letter").eq(i).width();
                }
                //w += $txtAi.find(".letter").eq(i).width() + 2;
                TweenMax.to($txtAi.find(".typing_area"), 0.03, {width:w, ease:"Quad.easeInOut"});
                TweenMax.to($txtAi, 0.03, {x:-w*0.5, ease:"Quad.easeInOut"});

                if(i === length-2){
                  if(device === "mobile"){
                    TweenMax.to($aiShape, 0.4, {autoAlpha:0, ease:"Expo.easeOut", delay:aihumanDelay});
                    TweenMax.to($mask, 0.4, {autoAlpha:0, ease:"Expo.easeOut", delay:aihumanDelay, onComplete:function(){
                      TweenMax.set($mask, {display:"none"});
                    }});
                  }
                  TweenMax.to($txtAi, 0.3, {autoAlpha:0, ease:"Quad.easeOut", delay:aihumanDelay, onComplete:function(){
                    TweenMax.set($txtAi, {clearProps:"all"});
                    _humanCom(hmArr[curIdx]);
                  }});
                }
              }
          });
        };

        // 사람 말풍선 모션
        var _humanCom = function(txt){
          var x;
          
          $txtHuman.text(txt);          
          $aiShape.removeClass("on");
          
          if(device === "desktop"){
            x = -(350+$txtHuman.width()*0.5);
          }else{
            x = -$txtHuman.width()*0.5;
          }

          TweenMax.set($txtHuman, {display:"block", height:0, scale:0.7, x:x});            // 중앙선과 사람 가운데까지 거리 : 350px
          TweenMax.to($txtHuman, 0.5, {autoAlpha:1, scale:1, height:43, ease:"Power3.easeInOut"});
          TweenMax.to($txtHuman, 0.5, {autoAlpha:0, ease:"Power3.easeInOut", delay:nextDelay, onComplete:function(){
              TweenMax.set($txtHuman, {display:"none"});
              curIdx++;
              _controlMotion();
          }});
        };

        // ai shape 모션
        var _pulseMotion = function(v){
            var firstRate = 1.02,
                repeatRate = 1.01;
            var t = new TimelineMax({repeat:v.repeat, repeatDelay:v.repeatDelay});
          
          	$aiShape.addClass("on");
            t.kill();
            t.to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:firstRate, ease:"Quad.easeIn"})
            .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:1.03, ease:"Quad.easeInOut"})
            .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:repeatRate, ease:"Quad.easeIn"})
            .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:1, ease:"Quad.easeInOut"});
        };

        return{
            init:init
        }
    })();
    
    // V4 영상 음소거 on/off
    var v4VideoMute = function(){
      var $techArea = $(".tech_area"),
          $btnMute = $techArea.find("button");
      var vInfo = [];
      
      for(var i=0; i<$btnMute.length; i++){
      	vInfo[i] = {
          btn: $btnMute.eq(i),
        	video: document.getElementById($btnMute.eq(i).data("target")),
          onoff: "off"
        };
      }
      
      $btnMute.click(function(e){
      	e.preventDefault();
        
        var idx = $(this).data("index");
        if(vInfo[idx].onoff === "off"){							// 소리가 꺼져있을 때
          for(var j=0; j<vInfo.length; j++){			// 다른 영상 소리 켜져있으면 끄도록
						if(!vInfo[j].video.muted) off(j);
          }
          on(idx);
        }else{
          off(idx);
        }
      });
      
      function on(i){
      	if(vInfo[i].video.muted) vInfo[i].video.muted = false;
      	vInfo[i].btn.attr("class", "on").find(".hidden").text("ON");
        vInfo[i].onoff = "on";
      }
    
    	function off(i){
      	if(!vInfo[i].video.muted) vInfo[i].video.muted = true;
        vInfo[i].btn.attr("class", "off").find(".hidden").text("OFF");
        vInfo[i].onoff = "off";
      }
    };
    
    // graph 모션
    var graphDraw = (function(){
      var $graphWrap, $graph, $target;
      var targetArr = [],
          num = 0,
          motionReady = true,
          prevDevice,
          browser;

      var init = function(){
        $graphWrap = $(".graph_wrap");
        $graph = $("#graph_path");
        $target = $graph.find("polyline");
        browser = app.mg.browser;
        
        _act();
      }; 
      
      var _act = function(){
        if(motionReady === false || app.mg.device != "desktop" || browser === "IE") return;
        
        var $mark = $graphWrap.find(".mark");
        var partCnt = 4,
            motionTime = 1.2;
            leng = $target[0].getTotalLength();


        $target.css({"stroke-dasharray":leng + "," + leng, "stroke-dashoffset":leng});
        var t = TweenMax.to($target, motionTime, {strokeDashoffset:0, ease:"Quad.easeOut"});

        TweenMax.set($mark, {display:"block", y:-10});
        TweenMax.set($mark.eq(3), {scale:0.8});

        TweenMax.to($mark.eq(0), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.2});
        TweenMax.to($mark.eq(1), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.4});
        TweenMax.to($mark.eq(2), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.6});
        TweenMax.to($mark.eq(3), 0.4, {autoAlpha:1, y:0, rotationY:360, ease:"Cubic.easeOut", delay:1.0});
        
        motionReady = false;
      };

      return {
        init:init
      }
    })();
    
    // 리포트 모션 (가로스크롤)
    var reportScroll = (function(){
      var $reportArea, $scrollArea;
      var rInfo = [],                     // 웹 report 영역 정보 array
          rIeInfo = [],                     // IE 웹 report 영역 정보 array
          rMInfo = [],                    // 태블릿,모바일 report 영역 정보 array
          allWidth = 0,
          winW,
          scrollFirst = true,							// 스크롤 덜컹거림 잡기
          mReady = [true],                // motion 준비여부
          device, prevDevice,
          winW, prevWinW,
          browser;

      var init = function(){
        $reportArea = $(".report_area");
        $scrollArea = $reportArea.find(".scroll_area");
        device = app.mg.device;
        browser = app.mg.browser;
       
       if(device === "desktop"){
        if(browser === "IE"){
          _settingIE();
        }else{
          _setting();
        }
       }else{
        _mobileSetting();
       }
        
        $(window).resize(function(){
          device = app.mg.device;
          winW = $(window).width();
          
          if(device != "desktop" && device != prevDevice && winW != prevWinW) _mobileSetting();       // 태블릿, 모바일에선 너비에 따라 높이가 바뀌는 report 영역 있으므로 + 너비만 바뀔 때 실행
          
          prevDevice = device;
          prevWinW = winW;
        });
        
        var offTop, height, maxRate,
            sStart, sEnd,
            sTop, sPrev,  scrollDir;
        
        $(window).scroll(function(){
          device = app.mg.device;
          
          if(device != "desktop"){
            TweenMax.set($scrollArea, {x:0});
          }else{
           if($scrollArea.width() <= 0){
              _setting();
            } 
          }
        	
          sTop = $(window).scrollTop();
          offTop = $reportArea.offset().top;
          height = $reportArea.height();
          sStart = offTop;
          sEnd = offTop + height;
          maxRate = (height-$(window).height())/height;
          
          if(sTop >= sStart && sTop <= sEnd){
            scrollDir = (sTop-sPrev) >= 0 ? "down" : "up"; 
            var r = (sTop-offTop)/height/maxRate > 1 ? 1 : (sTop-offTop)/height/maxRate;
          	
            if(device != "desktop"){
              mobileAct(scrollDir, r, sStart, height);
            }else{
              if(browser === "IE"){
                actIE(scrollDir, r, sStart, height);        // IE 에서 스크롤 모션 진행
              }else{
                act(scrollDir, r);
              }
            }
          }
          sPrev = sTop;
        });
      };

      var _setting = function(){
        if(device != "desktop") return;
        
        winW = $(window).width();
        rInfo = [];

        $reportArea.find(".report").each(function(i){
            var w = $(this).data("width");

            if(w.indexOf("px") > -1){
                w = Number(w.split("px")[0]);
            }else if(w.indexOf("vh") > -1){
                w = _vh(Number(w.split("vh")[0]));
            }else{}

            rInfo[i] = {
                ele: $(this),
                w: w,
                left: allWidth
            };

            allWidth += rInfo[i].w;
            TweenMax.set($(this), {display:"block", width:rInfo[i].w});
        });

        rInfo[0].left = 1200;       // 첫번째 영역 모션은 이미지 시작 시점부터

        if(allWidth > 0){
            //TweenMax.set($reportArea, {height:(allWidth-$(window).width())/$(window).width() * $(window).height()});
            TweenMax.set($reportArea.find(".scroll_area"), {width:allWidth});
        }
      };
      
      var _settingIE = function(){
        if(device != "desktop" || browser != "IE") return;
        
        rIeInfo = [];

        $reportArea.find(".report").each(function(i){
            var h = $(this).innerHeight();

            rIeInfo[i] = {
              ele: $(this),
              h: h,
              top: $(this).offset().top,
              ready: true
            };
        });
      };
      
      var _mobileSetting = function(){
        if(device === "desktop") return;
        
        rMInfo = [];

        $reportArea.find(".report").each(function(i){
            var h = $(this).innerHeight();

            rMInfo[i] = {
              ele: $(this),
              h: h,
              top: $(this).offset().top,
              ready: true
            };
        });
      };

      var act = function(dir, r){
        var $mark = $reportArea.find(".report_recom .mark");
        
        //TweenMax.to($scrollArea, 0.1, {x:-1 * (allWidth - winW) * r, ease:"Power1.easeOut"});
        /*if(r < 0.01 && dir === "down"){				// 영역도달한 후 조금 지난 뒤에 실행되도록
          console.log("zz: "+r);
          TweenMax.to($scrollArea, 0.8, {x:-1 * (allWidth - winW) * r, ease:"Linear.easeNone", delay:0.1});	
        }else{
          TweenMax.set($scrollArea, {x:-1 * (allWidth - winW) * r});	
        }*/
        
        if(scrollFirst){
          scrollFirst = false;
        	return;
        }
        
        //var val = (-1 * (allWidth) * r) < -(allWidth-$(window).width()) ? -(allWidth-$(window).width()) : (-1 * (allWidth) * r);
        var val = -1 * (allWidth-$(window).width()) * r;
        //TweenMax.set($scrollArea, {x:-1 * (allWidth) * r});	
        TweenMax.set($scrollArea, {x:val});	

        if(r >= (rInfo[0].left-rInfo[0].w*0.5)/allWidth && r<= (rInfo[0].left + rInfo[0].w)/allWidth){
          if(mReady[0]){
          	TweenMax.set($mark, {display:"block", y:-10});
            TweenMax.staggerTo($mark, 0.6, {autoAlpha:1, y:0, ease:"Expo.easeInOut"}, 0.1);
            mReady[0] = false;
          }
        }else{
        	if(!mReady[0]){
          	TweenMax.staggerTo($mark, 0.6, {autoAlpha:0, y:-10, ease:"Expo.easeInOut"}, 0.1);
         		mReady[0] = true;
          }
        }
        
        if(r >= (rInfo[6].left+rInfo[6].w*0.5)/allWidth && r<= (rInfo[6].left + rInfo[6].w)/allWidth){
          if(mReady[1]){
          	TweenMax.to($(".report_txt"), 0.5, {autoAlpha:0, ease:"Cubic.easeOut"});
          	mReady[1] = false;
          }
        }else{
          if(!mReady[1]){
          	TweenMax.to($(".report_txt"), 0.5, {autoAlpha:1, ease:"Cubic.easeOut"});
          	mReady[1] = true;
          }
        }
      };
      
      var actIE = function(dir, r, rpOffTop, rpH){
        var $mark = $reportArea.find(".report_recom .mark");
        var rIeRate = [];
        rIeInfo.forEach(function(v, i){
          rIeRate[i] = {
            start: (v.top - rpOffTop)/rpH,
            end: (v.top + v.h - rpOffTop)/rpH
          };
        });
        if(r >= rIeRate[0].start && r<= rIeRate[0].end){
          if(rIeInfo[0].ready){
            TweenMax.set($mark, {display:"block", y:-10});
            TweenMax.staggerTo($mark, 0.6, {autoAlpha:1, y:0, ease:"Expo.easeInOut"}, 0.1);
            rIeInfo[0].ready = false;
          }
        } 
       };
      
      var mobileAct = function(dir, r, rpOffTop, rpH){
        var $mark = $reportArea.find(".report_recom .mark");
        var rMRate = [];
        rMInfo.forEach(function(v, i){
          rMRate[i] = {
            start: (v.top - rpOffTop)/rpH,
            end: (v.top + v.h - rpOffTop)/rpH
          };
        });
        
        if(r >= rMRate[0].start && r<= rMRate[0].end){
          if(rMInfo[0].ready){
            TweenMax.set($mark, {display:"block", y:-10});
            TweenMax.staggerTo($mark, 0.6, {autoAlpha:1, y:0, ease:"Expo.easeInOut"}, 0.1);
            rMInfo[0].ready = false;
          }
        } 
       };

      // vh 계산
      var _vh = function(n){
      	return n / 100 * $(window).height();
      };

      return {
        init: init,
        act: act
      }
    })();
    
    //--------------------------------- inairAI 실행 코드----------------------------------------------------//
    var init = function(){
      var browser = app.mg.browser;
      if(browser === "IE") $("#wrap").addClass("ie");
      
      // 로딩 화면
    	TweenMax.to($(".full_loading"), 0.3, {autoAlpha:0, onComplete:function(){
        TweenMax.set($(".full_loading"), {display:"none"});
      }});
      
      gnbControl.init();
      
      if(browser === "IE"){
        canvasIE.init();
      }else{
        canvas.init({
          frame: 471,					// 이미지 수
          introEndSeq: 148,
          imgDir: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/notebook/",
          //imgDir: "http://www.midasinair.com/assets/images/inair/notebook/",
          imgFormat: ".jpg",
          bgColor:"#131218",
          imgW: 1920,					// 리사이징되어야 할 이미지 너비 (원본이미지: 1920x1080, 노트북 최대 너비 1174px 기준)
          imgH: 1080
        });
      }
      
      newsMobileSlide.init();     // 뉴스 반응형 슬라이드 교체
      processMotion.init();       // process 초기화
      
      // ai-사람 대화
      aiHumanCom.init(
          ["안녕하세요. 마케팅파트에 지원한 이지혜입니다", "지식도 중요하지만 무엇보다 실무 경험이라 생각합니다", "고객의 요구에 유연하게 대응해야 하기 때문입니다", "대학생 때 마케팅 관련 대외활동과 인턴 경험이 있습니다", "우수 인턴으로 선정되어 해외 연수를 다녀온 일입니다"],     // 사람 멘트
          ["반갑습니다. 이지혜님. AI역량검사에 오신 것을 환영합니다", "마케팅에 있어 가장 중요한 것은 무엇인가요?", "실무 경험이 중요한 이유는 무엇인가요?", "관련 실무 경험이 있으신가요?", "인턴 경험 때 가장 기억에 남는 일은 무엇인가요?"],                // ai 멘트
          [{rapid:0.1, repeat:5, repeatDelay:0.05}, 
          {rapid:0.08, repeat:4, repeatDelay:0.05},
          {rapid:0.08, repeat:4, repeatDelay:0.05},
          {rapid:0.08, repeat:4, repeatDelay:0.05},
          {rapid:0.08, repeat:5, repeatDelay:0.05}
          ]
      );
      
      // graph 모션
      scrollDetect.init([{
        ele: $(".graph_wrap"),
        type: "common",
        duration: 0,
        callback:function(dir, r){
          graphDraw.init();
        }
      }]);
      
      // v4 영상 음소거
      v4VideoMute();
      
      // 가로 스크롤 초기화
      reportScroll.init();
    };
    
    // inairAI return
  	return {
    	init:init,
      responsive:responsive
    }
    
    //--------------------------------- inairAI 실행 코드----------------------------------------------------//
  })();
  
  // 채용플랫폼
  app.namespace("inairPlatform");
  app.inairPlatform = (function(){
    // 반응형 분기 처리
    var responsive = (function(){
      var $builderList, $taskIntroVideo, $taskDbFigure, $taskReviewVideo, $taskScheFigure, $taskScheScreen, $storyAreaLogo;
      var device, prevDevice, browser;
      
      var src = {
        builderList: [
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img1.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img2.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img3.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img4.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img5.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img6.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img7.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img8.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img9.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img10.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img11.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/builder_img12.jpg",
        ],
        builderListM: [
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/builder_img1_m.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/builder_img2_m.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/builder_img3_m.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/builder_img4_m.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/builder_img5_m.jpg",
          "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/builder_img6_m.jpg"
        ],
        taskIntro: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/platform_task_intro2.mp4",
        taskIntroIE: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/platform_task_intro_ex.mp4",
        taskDashboard: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/pf_dashboard.png",
        taskDashboardM: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/pf_dashboard_m.png",
        taskReview: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/platform_task_2_2.mp4",
        taskReviewM: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/platform_task_2_mobile.mp4",
        taskScheduling: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/pf_scheduling.png",
        taskSchedulingM: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/pf_scheduling_m.png",
        taskScheScreen: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/pf_scheduling_pad.png", 
        taskScheScreenM: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/pf_scheduling_pad_m.png",
        logoLIG: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/platform/pf_logo_LIG.png",
        logoLIGM: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/platform/pf_logo_LIG_m.png" 
      };
      
      var init = function(){
        device = app.mg.device;
        browser = app.mg.browser;
        $builderList = $(".builder_list .list");
        $taskIntroVideo = $(".task.intro .video video");
        $taskDbFigure = $(".task.dashboard .img figure");
        $taskReviewVideo = $(".task.review .video video");
        $taskScheFigure = $(".task.scheduling .img>figure");
        $taskScheScreen = $(".task.scheduling .screen");
        $storyAreaLogo = $(".story_area .logo");
        
        _setting();
        
        $(window).resize(function(){
          prevDevice = device;
          device = app.mg.device;
          browser = app.mg.browser;
          
          if(device !== prevDevice) _setting();
        });
        
        prevDevice = device;
      };
      
      var _setting = function(){
        if(device === "desktop"){
          _desktop();
        }else{
          _mobile();
        }
      };
      
      var _desktop = function(){
        if(browser === "IE"){
          $taskIntroVideo.attr("src", src.taskIntroIE);
        }else{
          
        }
        _builderList.desktop();
        $taskDbFigure.html("<img src='"+src.taskDashboard+"' alt=''/>");
        $taskReviewVideo.attr("src", src.taskReview);
        $taskReviewVideo[0].play();
        $taskScheFigure.html("<img src='"+src.taskScheduling+"' alt=''/>");
        $taskScheScreen.html("<img src='"+src.taskScheScreen+"' alt=''/>");
        $storyAreaLogo.html("<img src='"+src.logoLIG+"' alt=''/>");
      };
      
      var _mobile = function(){
        if(device === "tablet"){
          _builderList.desktop();
          $taskDbFigure.html("<img src='"+src.taskDashboard+"' alt=''/>");
        }else{
          _builderList.mobile();
          $taskDbFigure.html("<img src='"+src.taskDashboardM+"' alt=''/>");
        }
        $taskReviewVideo.attr("src", src.taskReviewM);
        $taskReviewVideo[0].play();
        $taskScheFigure.html("<img src='"+src.taskSchedulingM+"' alt=''/>");
        $taskScheScreen.html("<img src='"+src.taskScheScreenM+"' alt=''/>");
        $storyAreaLogo.html("<img src='"+src.logoLIGM+"' alt=''/>");
      };
      
      // builderList 동적 기능
      var _builderList = {
        desktop: function(){
          var arr = src.builderList;
          $builderList.find("li").each(function(i){
            $(this).find("dd").html("<img src='"+arr[i]+"' alt=''>");
          });
        },
        mobile: function(){
          var arr = src.builderListM;
          $builderList.find("li").each(function(i){
            if($(this).hasClass("show")){
              $(this).find("dd").html("<img src='"+arr[i]+"' alt=''>");
            }else{
              $(this).find("dd").empty();
            }
          });
        }
      };
      
      return{
        init:init
      }
    })();
    
    // gnb 
    var gnbControl = (function(){
      var $header;
      var device,
          browserDetect,
          headerH,
          headerFold = true,
          headerStart,            // header 노출 시작 영역 offsettop 값
          headerChangeColor = 0;      // header 색상 바뀌는 시작 영역 offset top 값
      
      var init = function(){
        $header = app.mg.header;
        device = app.mg.device;
        browserDetect = navigator.userAgent.indexOf("Firefox");
        
        _setting();
        _scroll();
        
        $(window).resize(function(){
          _setting();                 
        });
      };
      
      var _setting = function(){
        device = app.mg.device;
        headerH = $header.height();
        headerStart = $(".builder_area").offset().top;
      };
      
      var _scroll = function(){
        var tY, prevTY, sTop, prevSTop, browserDelta;

        $(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
          sTop = $(window).scrollTop();

          // mousewheel 브라우저 분기 처리
          /*if(e.type === "touchmove"){
            tY = e.originalEvent.touches[0].clientY;
            if(tY > prevTY){
              browserDelta = 1;
            }else{
              browserDelta = -1;
            } 
            prevTY = tY;
          }else{
            if(browserDetect > -1){				// firefox
              browserDelta = e.originalEvent.detail * -1;				// firefox에선 스크롤 올리면 (-), 내리면 (+). wheelDelta랑 맞추기 위해 -1 곱함   
            }else{												// 나머지 브라우저
              browserDelta = e.originalEvent.wheelDelta;
            }
          }*/

          // mousewheel로 gnb 접고 펼침
          if(headerStart <= sTop){
            // header 접고 펼침
            if(device === "desktop"){                      // desktop 일 때
              if(headerFold === true){  
                _headerShow();
              }
            }else{                                        // tablet, mobile 일 때
              _headerFix();
            }
          }else{
            if(device === "desktop"){
              _headerHide();
            }else{
              _headerMHide();
            }
          }
          
          prevSTop = sTop;
        });
      };
      
      // desktop - header 펼침
      var _headerShow = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", y:-(headerH)});
        TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
        headerFold = false;
      };
      
      // desktop - header 접음
      var _headerHide = function(){
        TweenMax.killTweensOf($header);
        TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
          TweenMax.set($header, {display:"none"});
        }});
        headerFold = true;
      };
      
      // tablet, mobile - header 노출 및 고정
      var _headerFix = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", position:"fixed", y:0});
        headerFold = false;
      }; 
      
      // tablet, mobile - header 숨김
      var _headerMHide = function(){
        TweenMax.killTweensOf($header);
        //TweenMax.set($header, {display:"none", position:"absolute"});
        TweenMax.set($header, {display:"none"});
        headerFold = true;
      };
      
      return {
        init:init
      }
    })();
    
    // 인트로 모션
    var platformIntro = (function(){
      var $intro, $loadingArea, $portfolioArea, $introMask, $introTitleMask;
      var device, browser;

      var init = function(){
        $intro = $(".intro_area");
        $loadingArea = $intro.find(".loading_area");
        $portfolioArea = $intro.find(".portfolio_area");
        $introMask = $intro.find(".intro_mask");
        $introTitleMask = $intro.find(".intro_title_mask");
        device = app.mg.device;
        browser = app.mg.browser;
        
        if(device === "desktop" && browser != "IE") _loadingMotion();
        _portfolioMotion();
      };
      
     


      // 로딩 모션 - 첫번째 모션
      var _loadingMotion = function(){
        var $boxArea = $loadingArea.find(".box_area"),
            $imgArea = $loadingArea.find(".img_area");
        var boxLength = $boxArea.find(".box").length;

        TweenMax.set($loadingArea, {display:"block"});
        TweenMax.set($introMask, {display:"block"});
        TweenMax.set($imgArea, {display:"block"});

        TweenMax.staggerTo($boxArea.find(".box"), 0.8, {autoAlpha:1, ease:"Cubic.easeOut"}, 0.04);
        TweenMax.to($boxArea, 2.2, {autoAlpha:0, rotation:120, ease:"Cubic.easeIn", delay:1});
        TweenMax.to($imgArea, 2.2, {autoAlpha:1, ease:"Cubic.easeInOut", delay:1});
        TweenMax.to($introMask, 3.5, {borderWidth:120, ease:"Cubic.easeOut", delay:1.4});
        /*TweenMax.set($imgArea.find(".img1"), {scale:0.2, force3D:false});
        TweenMax.set($imgArea.find(".img2"), {scale:0.4, rotation:180, force3D:false});
        TweenMax.set($imgArea.find(".img3"), {scale:0.6, rotation:180, force3D:false});
        TweenMax.set($imgArea.find(".img4"), {scale:0.8, force3D:false});
        TweenMax.set($imgArea.find(".img5"), {scale:0.9, force3D:false});
        TweenMax.set($imgArea.find(".img6"), {scale:0.9, force3D:false, rotation:180});*/
        TweenMax.to($imgArea.find(".img6"), 0.8, {autoAlpha:1, ease:"Linear.easeNone", delay:1.4});
        TweenMax.to($imgArea.find(".img5"), 1.0, {autoAlpha:1, ease:"Linear.easeNone", delay:1.4});
        TweenMax.to($imgArea.find(".img4"), 1.0, {autoAlpha:1, ease:"Linear.easeNone", delay:1.5});
        TweenMax.to($imgArea.find(".img3"), 1.4, {autoAlpha:1, ease:"Linear.easeNone", delay:1.5});
        TweenMax.to($imgArea.find(".img2"), 1.5, {autoAlpha:1, ease:"Linear.easeNone", delay:1.7});
        TweenMax.to($imgArea.find(".img1"), 1.5, {autoAlpha:1, ease:"Linear.easeNone", delay:1.8});

        /*TweenMax.to($loadingArea, 3.3, {rotation:200, ease:"Quint.easeInOut", delay:0.5});							
        TweenMax.to($loadingArea, 3.5, {scale:250, force3D:false, ease:"Quint.easeInOut", delay:1});*/
        
        TweenMax.to($boxArea, 3.3, {rotation:200, ease:"Quint.easeInOut", delay:0.5});
        TweenMax.to($imgArea, 3.3, {rotation:200, ease:"Quint.easeInOut", delay:0.5});
        TweenMax.to($loadingArea, 3.5, {scale:250, force3D:false, ease:"Quint.easeInOut", delay:1});
        
        
        var d = 2.7;
        TweenMax.set($loadingArea, {clearProps:"all", display:"none", delay:d});
        TweenMax.set($boxArea, {clearProps:"all", delay:d});
        TweenMax.set($boxArea.find(".box"), {clearProps:"all", delay:d});
        TweenMax.set($imgArea, {clearProps:"all", delay:d});
        TweenMax.set($imgArea.find("p"), {clearProps:"all", delay:d});
        //TweenMax.killTweensOf($boxArea).delay(d);
        //TweenMax.killTweensOf($imgArea).delay(d);
        //TweenMax.killTweensOf($loadingArea).delay(d);
      };

      // 포트폴리오 나오는 모션 - 두번째 모션
      var _portfolioMotion = function(){
        var $portfolioWrap = $portfolioArea.find(".portfolio_wrap"),
            $portfolio = $portfolioArea.find(".portfolio"),
            $portfolioWrapMask = $portfolioWrap.find(".portfolio_wrap_mask"),
            $pf = $portfolio.find(".pf"),
            $shadow = $portfolio.find(".shadow"),
            $title1 = $intro.find(".title1"),
            $title2 = $portfolioArea.find(".title2"),
            $arrow = $portfolioArea.find(".main_arrow"),
            $scrollDown = $title2.find(".scroll_down");
        var d = (device === "desktop" && browser != "IE") ? 2.7 : 0; 

        TweenMax.set($portfolioArea, {display:"block", autoAlpha:0});
        TweenMax.set($title1, {display:"table", y:50});
        TweenMax.set($introTitleMask, {display:"block"});
        TweenMax.set($portfolio, {scale:1.05, x:"-50.1%", y:"-50.1%", rotateX:49, rotateY:0, rotateZ:43});
        TweenMax.set($portfolio.find(".pf.pf4"), {x:40, y:40, z:0});
        TweenMax.set($portfolio.find(".pf.pf6"), {x:0, y:0, z:0});
        TweenMax.set($portfolio.find(".pf.pf7"), {x:30, y:30, z:0});
        TweenMax.set($portfolio.find(".pf.pf8"), {x:30, y:30, z:0});
        TweenMax.set($portfolio.find(".pf.pf9"), {x:20, y:20, z:0});
        TweenMax.set($portfolio.find(".pf.pf10"), {x:100, y:85, z:0});
        TweenMax.set($title2, {display:"block"});
        TweenMax.set($title2.find("h2 p"), {y:300});
        TweenMax.set($title2.find(".txt"), {autoAlpha:0, y:100});

        TweenMax.to($portfolioArea, 1.0, {autoAlpha:1, ease:"Quad.easeIn", delay:d});
        TweenMax.to($portfolio, 1.0, {scale:1, ease:"Quad.easeInOut", delay:d+0.2});
        TweenMax.to($portfolio.find(".pf.pf4"), 1.2, {x:0, y:0, z:5, ease:"Expo.easeInOut", delay:d+0.3});
        TweenMax.to($portfolio.find(".pf.pf7"), 1.2, {x:0, y:0, z:3, ease:"Expo.easeInOut", delay:d+0.3});
        TweenMax.to($portfolio.find(".pf.pf8"), 1.2, {x:0, y:0, z:6, ease:"Expo.easeInOut", delay:d+0.3});
        TweenMax.to($portfolio.find(".pf.pf9"), 1.2, {x:0, y:0, z:3, ease:"Expo.easeInOut", delay:d+0.3});
        TweenMax.to($portfolio.find(".pf.pf10"), 1.2, {x:0, y:0, z:7, ease:"Expo.easeInOut", delay:d+0.3});

        TweenMax.to($title1, 0.7, {autoAlpha:1, y:0, ease:"Quad.easeInOut", delay:d+0.5});
        TweenMax.to($introTitleMask, 0.7, {autoAlpha:1, ease:"Quad.easeInOut", delay:d+0.5});
        TweenMax.to($introMask, 1.0, {borderWidth:0, ease:"Expo.easeInOut", delay:d+0.5, onComplete:function(){
          TweenMax.set($introMask, {clearProps:"all"});
        }});

        TweenMax.to($portfolio, 1.5, {x:"-10%", ease:"Expo.easeInOut", delay:d+2.2});
        TweenMax.to($title1, 1.5, {autoAlpha:0, x:"30%", ease:"Expo.easeInOut", delay:d+2.1, onComplete:function(){
          TweenMax.set($title1, {display:"none"});
        }});
        TweenMax.to($introTitleMask, 1.5, {autoAlpha:0, ease:"Quad.easeInOut", delay:d+2.1, onComplete:function(){
          TweenMax.set($introTitleMask, {display:"none"});
        }});
        
        if(device !== "desktop"){
          TweenMax.to($title2.find(".eng"), 2.0, {autoAlpha:1, ease:"Power4.easeOut", delay:d+2.6});
          TweenMax.set($portfolioWrapMask, {display:"block"});
          TweenMax.to($portfolioWrapMask, 1.5, {autoAlpha:0.7, ease:"Quad.easeInOut", delay:d+2.4});
        }else{
          TweenMax.to($title2.find(".eng"),1.3, {autoAlpha:1, ease:"Quint.easeIn", delay:d+2});
          TweenMax.set($scrollDown, {display:"block", y:5});
          TweenMax.to($scrollDown, 0.6, {autoAlpha:1, y:0, ease:"Quad.easeInOut", delay:d+3.7});
        }

        TweenMax.to($title2.find("h2 p").eq(0), 2.0, {y:0, ease:"Power4.easeOut", delay:d+2});
        TweenMax.to($title2.find("h2 p").eq(1), 1.7, {y:0, ease:"Power4.easeOut", delay:d+2.3});
        TweenMax.to($title2.find("h2 p").eq(2), 1.4, {y:0, ease:"Power4.easeOut", delay:d+2.6});

        TweenMax.to($title2.find("h2 p").eq(0), 1.3, {autoAlpha:1, ease:"Quint.easeIn", delay:d+2});
        TweenMax.to($title2.find("h2 p").eq(1), 1.3, {autoAlpha:1, ease:"Quint.easeIn", delay:d+2.3});
        TweenMax.to($title2.find("h2 p").eq(2), 1.3, {autoAlpha:1, ease:"Quint.easeIn", delay:d+2.6});

        TweenMax.to($title2.find(".txt"), 1.1, {y:0, ease:"Power4.easeOut", delay:d+3.0});
        TweenMax.to($title2.find(".txt"), 0.8, {autoAlpha:1, ease:"Quint.easeIn", delay:d+3.0});
        
        /*TweenMax.to($arrow, 0.4, {autoAlpha:1, ease:"Quad.easeOut", repeat:-1, delay:d+3.5});
        TweenMax.to($arrow, 0.8, {y:30, ease:"Quad.easeInOut", repeat:-1,  delay:d+3.5});
        TweenMax.to($arrow, 0.4, {autoAlpha:0, ease:"Quad.easeOut", repeat:-1, delay:d+4.5});
        TweenMax.set($arrow, {y:130, delay:d+4.3, repeat:-1});*/
      };

      return{
        init:init
      }
    })();
    
    // 채용플랫폼 두번째 판영역
    var panMotion = {
      $panArea: null,
      $panEle: null,
      panEleLength: 0,
      arr3d: [],
      mobileMotion: true,
      init:function(){
          var _ = this;
          _.$panArea = $(".pan_area");
          _.$panEle = _.$panArea.find(".pan_ele");
          _.panEleLength = _.$panEle.length;
          _.$panEle.each(function(){
              var t = $(this).css("transform").split(",");
              _.arr3d.push({
                  x: Number(t[12]),
                  y: Number(t[13]),
                  z: Number(t[14])
              });
          });
      },
      act:function(dir, r){
          var _ = this,
              arr3dAfter = [],
              rate = r;             
					
          for(var i=0; i<_.panEleLength; i++){
              arr3dAfter.push({
                  x: _.arr3d[i].x * ((1-rate) - 0.05*i%4) > 0 ? 0 : _.arr3d[i].x * ((1-rate) - 0.05*i%4),
                  y: _.arr3d[i].y * ((1-rate) - 0.05*i%4) > 0 ? 0 : _.arr3d[i].y * ((1-rate) - 0.05*i%4),
                  z: _.arr3d[i].z * ((1-rate) - 0.05*i%4) < 0 ? 0 : _.arr3d[i].z * ((1-rate) - 0.05*i%4)
              });
              //console.log(arr3dAfter[i].x, arr3dAfter[i].y, arr3dAfter[i].z)
          }

          TweenMax.to(_.$panEle.eq(0), 0.4, {x:arr3dAfter[0].x, y:arr3dAfter[0].y, z:arr3dAfter[0].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(1), 0.2, {x:arr3dAfter[1].x, y:arr3dAfter[1].y, z:arr3dAfter[1].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(2), 0.3, {x:arr3dAfter[2].x, y:arr3dAfter[2].y, z:arr3dAfter[2].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(3), 0.1, {x:arr3dAfter[3].x, y:arr3dAfter[3].y, z:arr3dAfter[3].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(4), 0.2, {x:arr3dAfter[4].x, y:arr3dAfter[4].y, z:arr3dAfter[4].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(5), 0.4, {x:arr3dAfter[5].x, y:arr3dAfter[5].y, z:arr3dAfter[5].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(6), 0.2, {x:arr3dAfter[6].x, y:arr3dAfter[6].y, z:arr3dAfter[6].z, ease:"Power3.easeOut"});
          TweenMax.to(_.$panEle.eq(7), 0.05, {x:arr3dAfter[7].x, y:arr3dAfter[7].y, z:arr3dAfter[7].z, ease:"Power3.easeOut"});

        var bgW = (100 * rate) > 100 ? 100 : (100 * rate),
            bgH = (100 * rate) > 100 ? 100 : (100 * rate);
        
          TweenMax.to(_.$panArea.find(".pan_bg"), 0.3, {width:bgW + "%", height:bgH + "%", ease:"Quint.easeOut"});
          TweenMax.to(_.$panEle.find(".bg"), 0.3, {width:bgW + "%", height:bgH + "%", ease:"Quint.easeOut"});
          if(bgW === 100) {
              TweenMax.to(_.$panEle.find(".img"), 0.3, {boxShadow:"1px 1px #7597ff"});
          }else{
              TweenMax.to(_.$panEle.find(".img"), 0.3, {boxShadow:"1px 1px #c5c5c5"});
          }

          var y = -1 * ($(window).height() + _.$panArea.find(".pan_txt").height()+50) * rate;
          TweenMax.to(_.$panArea.find(".pan_txt"), 0.4, {y:y, ease:"Quad.easeOut"});

          var t = -27.1 * rate < -27.1 ? -27.1 : -27.1 * rate;
          TweenMax.to(_.$panArea.find(".pan_shadow"), 0.3, {y:t + "%", ease:"Power3.easeOut"});
      },
      mobileAct:function(){
        var _ = this;
        if(_.mobileMotion === false) return;
        var delay = 0.2;
        TweenMax.set(_.$panArea.find(".pan_txt"), {y:_vh(50)});
        
        TweenMax.to(_.$panEle.eq(0), 1.2, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(1), 0.8, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(2), 0.6, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(3), 0.6, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(4), 1.0, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(5), 0.8, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(6), 0.8, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.eq(7), 0.6, {x:0, y:0, z:0, delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panArea.find(".pan_shadow"), 0.8, {x:"-50.1%", y:"-40%", delay:delay, ease:"Power3.easeOut"});
        TweenMax.to(_.$panEle.find(".img"), 0.3, {boxShadow:"1px 1px #c5c5c5"});
        TweenMax.to(_.$panArea.find(".pan_bg"), 1.0, {width:"100%", height:"100%", delay:delay, ease:"Quint.easeOut", onComplete:function(){
          TweenMax.to(_.$panEle.find(".img"), 0.3, {boxShadow:"1px 1px #7597ff"});
        }});
        TweenMax.to(_.$panEle.find(".bg"), 1.0, {width:"100%", height:"100%", delay:delay, ease:"Quint.easeOut"});
        TweenMax.to(_.$panArea.find(".pan_txt"), 1.0, {y:0, ease:"Cubic.easeOut", delay:delay+0.2});
        
        _.mobileMotion = false;
                                                         
        function _vh(n){
          return n / 100 * $(window).height();                                                
        }                                                 
      }
  	};
    
    // 가로스크롤
    var taskScroll = (function(){
      var $taskArea, $scrollArea;
      var rInfo = [],                     // 웹 task 영역 정보 array
          rIeInfo = [],                     // IE 웹 task 영역 정보 array
          rMInfo = [],                    // 태블릿,모바일 task 영역 정보 array
          allWidth = 0,
          winW,
          scrollFirst = true,             // 스크롤 덜컹거림 잡기
          mReady = [true],                // motion 준비여부
          device, prevDevice, browser,
          winW, prevWinW;

      var init = function(){
        $taskArea = $(".task_area");
        $scrollArea = $taskArea.find(".scroll_area");
        device = app.mg.device;
        browser = app.mg.browser;

        _onlineTab.init();
        
       if(device === "desktop"){
        if(browser === "IE"){
          _settingIE();
        }else{
          _setting();
        }
       }else{
        _mobileSetting();
       }

        $(window).resize(function(){
          device = app.mg.device;
          winW = $(window).width();

          if(device === "desktop"){
            _setting();
          }else{
            if(device != prevDevice && winW != prevWinW) _mobileSetting();       // 태블릿, 모바일에선 너비에 따라 높이가 바뀌는 report 영역 있으므로 + 너비만 바뀔 때 실행
          }
          prevDevice = device;
          prevWinW = winW;
        });

        var offTop, height, maxRate,
            sStart, sEnd,
            sTop, sPrev,  scrollDir;

        $(window).scroll(function(){
          device = app.mg.device;

          if(device != "desktop"){
            TweenMax.set($scrollArea, {x:0});
          }else{
           if($scrollArea.width() <= 0){
              _setting();
            } 
          }

          sTop = $(window).scrollTop();
          offTop = $taskArea.offset().top;
          height = $taskArea.height();
          sStart = offTop;
          sEnd = offTop + height;
          maxRate = (height-$(window).height())/height;

          if(sTop >= sStart && sTop <= sEnd){
            scrollDir = (sTop-sPrev) >= 0 ? "down" : "up"; 
            var r = (sTop-offTop)/height/maxRate > 1 ? 1 : (sTop-offTop)/height/maxRate;

            if(device != "desktop"){
              mobileAct(scrollDir, r, sStart, height);
            }else{
              if(browser === "IE"){
                actIE(scrollDir, r, sStart, height);
              }else{
                act(scrollDir, r);
              }
            }
          }
          sPrev = sTop;
        });
      };

      var _setting = function(){
        if(device != "desktop") return;

        allWidth = 0;
        winW = $(window).width();
        rInfo = [];

        $taskArea.find(".task").each(function(i){
          var w = $(this).innerWidth();     // padding 포함한 너비

          rInfo[i] = {
              ele: $(this),
              w: w,
              left: allWidth,
              ready: true
          };

          allWidth += rInfo[i].w;
        });

        if(allWidth > 0){
          rInfo.forEach(function(v, i){
            rInfo[i].rs = rInfo[i].left / allWidth;
            rInfo[i].re = (rInfo[i].left + rInfo[i].w) / allWidth;
          });

          TweenMax.set($taskArea.find(".scroll_area"), {width:allWidth});
          TweenMax.set($taskArea, {height:allWidth});
        }
      };
      
      var _settingIE = function(){
        if(device != "desktop" || browser != "IE") return;

        rIeInfo = [];

        $taskArea.find(".task").each(function(i){
            var h = $(this).innerHeight();

            rIeInfo[i] = {
              ele: $(this),
              h: h,
              top: $(this).offset().top,
              ready: true
            };
        });
      };

      var _mobileSetting = function(){
        if(device === "desktop") return;

        rMInfo = [];

        $taskArea.find(".task").each(function(i){
            var h = $(this).innerHeight();

            rMInfo[i] = {
              ele: $(this),
              h: h,
              top: $(this).offset().top,
              ready: true
            };
        });
      };

      var act = function(dir, r){      
        if(scrollFirst){
          scrollFirst = false;
          return;
        }

        var val = -1 * (allWidth-$(window).width()) * r;
        TweenMax.set($scrollArea, {x:val}); 

        if(rInfo[0].rs <= r && r < rInfo[0].re){
          if(!rInfo[0].ready) return;

          $(".task.intro video")[0].play();
          rInfo[0].ready = false;
        }else if(rInfo[2].rs * 1.2 <= r && r < rInfo[2].re){
          if(!rInfo[2].ready) return;

          $(".task.review video")[0].play();
          rInfo[2].ready = false;
        }else if(rInfo[3].rs * 1.32 <= r && r < rInfo[3].re){
          if(!rInfo[3].ready) return;

          var $screen = $(".task.scheduling .screen"),
              $hand = $(".task.scheduling .hand");

          TweenMax.set($hand, {autoAlpha:0, x:_vh(-50)});
          //TweenMax.to($screen, 0.4, {x:_vh(-5.2), ease:"Expo.easeInOut"});
          TweenMax.to($hand, 0.5, {autoAlpha:1, ease:"Cubic.easeOut", delay:0.3});
          TweenMax.to($hand, 1.0, {x:0, ease:"Cubic.easeInOut", delay:0.8});
          rInfo[3].ready = false;
        }else if(rInfo[5].rs <= r && r < rInfo[5].re){
          if(!rInfo[5].ready) return;

          var $hand = $(".task.oneclick .hand");

          TweenMax.set($hand, {rotation:"-60deg", x:_vh(-12), y:-1*_vh(-13)});
          TweenMax.to($hand, 0.8, {rotation:0, x:0, y:0, ease:"Expo.easeOut", delay:0.4});
          TweenMax.to($hand, 0.5, {autoAlpha:1, ease:"Quad.easeOut", delay:0.4});
          rInfo[5].ready = false;
        }
      };
      
      var actIE = function(dir, r, rpOffTop, rpH){
        var rIeRate = [];
        rIeInfo.forEach(function(v, i){
          rIeRate[i] = {
            start: (v.top - rpOffTop)/rpH,
            end: (v.top + v.h - rpOffTop)/rpH
          };
        });

        if(r >= rIeRate[0].start && r<= rIeRate[0].end){
          if(rIeInfo[0].ready){
            $(".task.intro video")[0].play();
            rIeInfo[0].ready = false;
          }
        }else if(r >= rIeRate[2].start-0.1 && r<= rIeRate[2].end){
          if(rIeInfo[2].ready){
            $(".task.review video")[0].play();
            rIeInfo[2].ready = false;
          }
        }else if(r >= rIeRate[3].start+0.1 && r<= rIeRate[3].end){
          if(!rIeInfo[3].ready) return;

          var $screen = $(".task.scheduling .screen"),
              $hand = $(".task.scheduling .hand");

          TweenMax.set($hand, {autoAlpha:0, x:_vh(-50)});
          //TweenMax.to($screen, 0.4, {x:_vh(-5.2), ease:"Expo.easeInOut"});
          TweenMax.to($hand, 0.5, {autoAlpha:1, ease:"Cubic.easeOut", delay:0.3});
          TweenMax.to($hand, 1.0, {x:0, ease:"Cubic.easeInOut", delay:0.8});
          rIeInfo[3].ready = false;
        }else if(r >= rIeRate[5].start && r<= rIeRate[5].end){
          if(rIeInfo[5].ready){
            var $hand = $(".task.oneclick .hand");

            TweenMax.set($hand, {rotation:"-60deg", x:_vh(-12), y:-1*_vh(-13)});
            TweenMax.to($hand, 0.8, {rotation:0, x:0, y:0, ease:"Expo.easeOut", delay:0.4});
            TweenMax.to($hand, 0.5, {autoAlpha:1, ease:"Quad.easeOut", delay:0.4});
            rIeInfo[5].ready = false;
          }
        } 
       };

      var mobileAct = function(dir, r, rpOffTop, rpH){
        var rMRate = [];
        rMInfo.forEach(function(v, i){
          rMRate[i] = {
            start: (v.top - rpOffTop)/rpH,
            end: (v.top + v.h - rpOffTop)/rpH
          };
        });

        if(r >= rMRate[0].start && r<= rMRate[0].end){
          if(rMInfo[0].ready){
            $(".task.intro video")[0].play();
            rMInfo[0].ready = false;
          }
        }else if(r >= rMRate[2].start && r<= rMRate[2].end){
          if(rMInfo[2].ready){
            
            $(".task.review video")[1].play();
            rMInfo[2].ready = false;
          }
        }else if(r >= rMRate[5].start && r<= rMRate[5].end){
          if(rMInfo[5].ready){
            var $hand = $(".task.oneclick .hand");

            TweenMax.set($hand, {rotation:"-60deg", x:_vh(-12), y:-1*_vh(-13)});
            TweenMax.to($hand, 0.8, {rotation:0, x:0, y:0, ease:"Expo.easeOut", delay:0.4});
            TweenMax.to($hand, 0.5, {autoAlpha:1, ease:"Quad.easeOut", delay:0.4});
            rMInfo[5].ready = false;
          }
        } 
       };

      // vh 계산
      var _vh = function(n){
        return n / 100 * $(window).height();
      };

      var _onlineTab = {
        $online: null,
        $slide: null,
        curIdx: 0,
        init:function(){
          var _ = this;

        _.$online = $(".task.online");
        _.$slide = _.$online.find(".img_slides .slide");
        var $slideIndi = _.$online.find(".slide_indi");

        _.$slide.on("init", function(){
          var lng = _.$slide.find("li").length;
          var html = "";
          html += "<ul>";
          for(var i = 0; i<lng; i++){
            html += "<li><button type='button' data-index='"+i+"'><span class='hidden'>"+i+"</span></button></li>";
          }
          html += "</ul>";

          $slideIndi.html(html);
          _.tabOn(0);
          _.indiOn(0);
          _.makeTxt(0);
        });

        _.$slide.slick({
          fade:true,
          slidesToShow:1,
          slidesToScroll:1,
          arrows:false,
          dots:false,
          infinite: true,
          autoplay:false,
          autoplaySpeed:3500,
          draggable:false,
          swipe:false,
          speed:500,
          //cssEase:"cubic-bezier(0.225, 0.625, 0.245, 1.025)",
          cssEase: "ease-out",
          zIndex:80,
          pauseOnHover:false,
          pauseOnFocus:false
        }); 

        _.btnAct();
      },
      makeTxt:function(i){
        var _ = this,
            $tabConDl = _.$online.find(".tab_con>dl");

        var txtArr = [
          {title:"인포그래픽 이력서", txt:"지원자의 정보가 인포그래픽 형태로 제공되어<span class='in-bl'> </span>쉽고 빠르게 정보를 확인할 수 있습니다."},
          {title:"지원서", txt:"지원서 내용을 온라인에서 상세히 제공하고<span class='in-bl'> </span>항목별로 검색도 가능합니다."},
          {title:"블라인드 면접", txt:"기업 고유의 기준에 따라 블라인드 대상자와<span class='in-bl'> </span>정보 공개 범위를 설정할 수 있습니다."},
          {title:"역검 결과", txt:"역검 결과를 요약 리포트와 백분위 비교분석으로<span class='in-bl'> </span>쉽고 정확하게 전달합니다."},
          {title:"지원자 이력확인", txt:"지원자의 과거 이력이나 동료의 평가현황을<span class='in-bl'> </span>실시간으로 확인할 수 있습니다."},
          {title:"구조화 질문 리스트", txt:"AI역량검사 결과 기반으로 강점과 약점을 분석해<span class='in-bl'> </span>꼭 해야만 하는 질문을 추천해줍니다."},
          {title:"평가하기", txt:"평가 기준에 대한 상세한 가이드를 확인하고<span class='in-bl'> </span>실시간으로 지원자를 평가하세요."},
          {title:"채팅/메모", txt:"평가자 간 실시간 채팅과 메모 기능으로<span class='in-bl'> </span>면접을 보다 효율적으로 진행할 수 있습니다."}
        ];

        $tabConDl.find("dt").html(txtArr[i].title);
        $tabConDl.find("dd").html(txtArr[i].txt);
        //TweenMax.to($tabConDl, 0.3, {autoAlpha:1, ease:"Quad.easeOut", delay:0.2});
      },
      btnAct:function(){
        var _ = this,
            $tab = _.$online.find(".tab"),
            $slideDir = _.$online.find(".slide_dir"),
            $slideIndi = _.$online.find(".slide_indi");

        // tab click
        $tab.find("a").click(function(e){
          e.preventDefault();
          _.curIdx = $(this).parent().index();
          _.tabOn(_.curIdx);
          _.indiOn(_.curIdx);
          _.makeTxt(_.curIdx);
          _.$slide.slick("slickGoTo", _.curIdx);
        });

        // slide dir Btn
        $slideDir.find("button").click(function(){
          if($(this).hasClass("prev")){
            _.$slide.slick("slickPrev");
          }else{
            _.$slide.slick("slickNext");
          }
          _.curIdx = _.$slide.slick("slickCurrentSlide");
          _.tabOn(_.curIdx);
          _.indiOn(_.curIdx);
          _.makeTxt(_.curIdx);
        });

        // indicator click
        $slideIndi.find("button").click(function(){
          _.curIdx = Number($(this).attr("data-index"));
          _.indiOn(_.curIdx);
          _.tabOn(_.curIdx);
          _.makeTxt(_.curIdx);
          _.$slide.slick("slickGoTo", _.curIdx);
        });
      },
      tabOn:function(i){
        var _ = this,
            $tab = _.$online.find(".tab");

        if($tab.find("li.on").length > 0){
          var $prevTarget = $tab.find("li.on");
          $prevTarget.removeClass("on");
          TweenMax.to($prevTarget.find(".mask"), 0.3, {autoAlpha:0, ease:"Quad.easeOut", onComplete:function(){
            TweenMax.set($prevTarget.find(".mask"), {display:"none"});
          }});
        }

        var $target = $tab.find("li").eq(i);
        $target.addClass("on");
        TweenMax.to($target.find(".mask"), 0.3, {display:"block", autoAlpha:0.4, ease:"Quad.easeOut"});
      },
      indiOn:function(i){
        var _ = this,
            $slideIndi = _.$online.find(".slide_indi");

        if($slideIndi.find("li.on").length > 0){
          var $prevTarget = $slideIndi.find("li.on");
          $prevTarget.removeClass("on");
        }

        var $target = $slideIndi.find("li").eq(i);
        $target.addClass("on");
      }
    };

      return {
        init:init
      }
    })();
    
    // 패럴랙스
    /*var parallax = (function(){
    var $parallaxArea, $parItem;
    var device, browser,
        winH,                         // window Height
        parOffTop = 0, parH = 0,      // $parallaxArea offset top, $parallaxArea height
        parInfo = [],
        parLng = 0,                   // parItem 수
        mReady = [true, true, true];

    var init = function(){ 
      device = app.mg.device;
      browser = app.mg.browser;
      
      if(device != "desktop" || browser === "IE") return;
      
      $parallaxArea = $(".parallax_area");
      $parItem = $parallaxArea.find(".par_item");

      _setting();
      _act();

      $(window).resize(function(){
        if(device != "desktop") return;
        _setting();
      });
    };

    var _setting = function(){
      winH = $(window).height();
      parOffTop = $parallaxArea.offset().top;
      parH = $parallaxArea.height();
      parLng = $parItem.length;
    }; 

    var _act = function(){
      var sStart, sEnd,
          sTop, prevSTop,
          dir;

      $(window).on("scroll", function(e){ 
        device = app.mg.device;
        if(device != "desktop" || browser === "IE") return;

        sTop = $(window).scrollTop();
        sStart = parOffTop;
        sEnd = parOffTop + parH;
        dir = (sTop - prevSTop) > 0 ? "down" : "up";
        
        // $parallaxArea 도달했을 때 기능 실행
        if(sStart <= sTop && sTop <= sEnd){
          var rate = (sTop-sStart)/(parH-winH) > 1 ? 1 : (sTop-sStart)/(parH-winH);
          _motion(rate, dir);
        }
        prevSTop = sTop;
      });
    }; 

    // 스크롤 막기/풀기
    var _scrollControl = function(status){
      if(status === "prevent"){
        $("html, body").on("scroll wheel mousewheel", function(e){
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
      }else{
        $("html, body").off("scroll wheel mousewheel");
      }
    }

    var _motion = function(r, dir){
      var curIdx, nextIdx;
      var rv = 1 / parLng;

      for(var i = 1; i<parLng; i++){
        if(rv*i <= r && r < rv*(i+1)){
          
          if(dir === "down"){
            if(!mReady[i]) return;
            _scrollControl("prevent");

            curIdx = i-1;
            nextIdx = i;
            _motionAct(curIdx, nextIdx, dir);
            mReady[i] = false;
          }else{
            if(mReady[i]) return;
            _scrollControl("prevent");

            curIdx = i;
            nextIdx = i-1;
            _motionAct(curIdx, nextIdx, dir);
            mReady[i] = true;
          }
          
        }
      }
    };

    var _motionAct = function(cur, next, dir){
      if(cur === null || next === null) return;
      var $cur = $parItem.eq(cur),
          $next = $parItem.eq(next);

      if(dir === "down"){
        TweenMax.set($cur, {zIndex:1, scale:1, z:0});
        TweenMax.set($next, {zIndex:5});
        TweenMax.set($next, {display:"block", autoAlpha:0, top:"100%", scale:1, z:0});
        TweenMax.set($next.find(".con_area"), {autoAlpha:0, y:50});
        TweenMax.set($next.find(".img_area"), {autoAlpha:0, x:50});

        TweenMax.to($cur, 0.5, {scale:0.6, z:-300, autoAlpha:0, ease:"Quad.easeOut"});
        TweenMax.to($next, 0.2, {autoAlpha:1, ease:"Cubic.easeOut"});
        TweenMax.to($next, 1.0, {top:0, ease:"Quint.easeOut", onComplete:function(){
          _scrollControl("act");
        }});
        TweenMax.to($next.find(".con_area"), 0.8, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.7});
        TweenMax.to($next.find(".img_area"), 0.8, {autoAlpha:1, x:0, ease:"Quad.easeOut", delay:0.7});

        mReady[cur] = false;
      }else{
        TweenMax.set($cur, {zIndex:1, scale:1});
        TweenMax.set($next, {zIndex:5});
        TweenMax.set($next, {display:"block", autoAlpha:0, top:"-100%", scale:1, z:0});
        TweenMax.set($next.find(".con_area"), {autoAlpha:0, y:50});
        TweenMax.set($next.find(".img_area"), {autoAlpha:0, x:50});

        TweenMax.to($cur, 0.5, {scale:0.6, z:-300, autoAlpha:0, ease:"Quad.easeOut"});
        TweenMax.to($next, 0.2, {autoAlpha:1, ease:"Cubic.easeOut"});
        TweenMax.to($next, 1.0, {top:0, ease:"Quint.easeOut", onComplete:function(){
          _scrollControl("act");
        }});
        TweenMax.to($next.find(".con_area"), 0.8, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.7});
        TweenMax.to($next.find(".img_area"), 0.8, {autoAlpha:1, x:0, ease:"Quad.easeOut", delay:0.7});

        mReady[cur] = true;
      }
    };

    return{
      init:init
    }
  })();*/
    
    
    //--------------------------------- inairPlatform 실행 코드----------------------------------------------------//
    var init = function(){
      var device = app.mg.device,
          browser = app.mg.browser;
      var $header = app.mg.header;
      if(browser === "IE") $("#wrap").addClass("ie");
      
      // 로딩 화면
    	TweenMax.to($(".full_loading"), 0.3, {autoAlpha:0, onComplete:function(){
        TweenMax.set($(".full_loading"), {display:"none"});
      }});
      
      gnbControl.init();
    	platformIntro.init();						// 채용플랫폼 intro 모션
    	panMotion.init();								// 판 모션 초기화
      taskScroll.init();              // 가로스크롤
      //parallax.init();
 
    	
    	scrollDetect.init([{
        ele: $(".pan_area"),
        type: "sticky",
        duration: "win*0.5",
        callback:function(dir, r){
          device = app.mg.device;
          if(device === "desktop" && browser != "IE"){
            if($header.css("display") === "block"){
              TweenMax.set($header, {display:"none"});
            }
            panMotion.act(dir, r);
          }else{
            panMotion.mobileAct();
          }
        }
      },{
        ele: $(".builder_area"),
        type: "common",
        duration: 0,
        callback:function(dir, r){
          if(app.mg.device === "desktop"){
            if($header.css("display") === "block") return;
            TweenMax.set($header, {display:"block"});
          }
        }
      }]);
    };
    
    return{
    	init:init,
      responsive:responsive
    }
    //--------------------------------- inairPlatform 실행 코드----------------------------------------------------//
  })();
  
  // 채용프로세스 - 모집
  app.namespace("recruitMotion");
  app.recruitMotion = (function(){
    var $prRecruit, $section;
    var sectionArr = [];

    var init = function(){
      $prRecruit = $("#container.pr_recruitment");
      $section = $prRecruit.find(">section");
      $section.each(function(i){
        sectionArr.push({
          index: i,
          height: $(this).outerHeight(),
          offsetTop: $(this).offset().top
        });
      });

      //_builderMotion();				// 스마트웹빌더 모션 실행
      _typeSlide.init([
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img1.jpg",
          name: "A TYPE",
          title: "Stable<br/>&Trust",
          subtitle: "보편적인 가로형으로 안정적이고<span class='bl-in'> </span>신뢰가는 느낌을 연출할 수 있습니다."
        },
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img2.jpg",
          name: "B TYPE",
          title: "Trendy<br/>&Innov.",
          subtitle: "차별화된 세로형으로 혁신적이고<span class='bl-in'> </span>진취적인 느낌을 연출할 수 있습니다."
        },
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img3.jpg",
          name: "C TYPE",
          title: "Modern<br/>&Simple",
          subtitle: "트랜디한 모던 UI 디자인으로 심플하고<span class='bl-in'> </span>논리적인 느낌을 연출할 수 있습니다."
        },
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img4.jpg",
          name: "D TYPE",
          title: "Variety<br/>&Brand",
          subtitle: "좌우 측 배경 이미지를 다르게 배치하여<span class='bl-in'> </span>다양한 톤앤매너와 브랜드 표현이 가능합니다."
        },
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img5.jpg",
          name: "E TYPE",
          title: "Full<br/>&Cool",
          subtitle: "풀 비주얼이 배치되어 시원한 느낌을 주며<span class='bl-in'> </span>강력한 브랜드 이미지를 표현할 수 있습니다."
        },
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img6.jpg",
          name: "F TYPE",
          title: "Stable<br/>&Power",
          subtitle: "풀 이미지가 가로로 배치되어 안정적이고<span class='bl-in'> </span>파워풀한 느낌을 연출할 수 있습니다."
        },
        {
          img: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/process/typeslide_img7.jpg",
          name: "G TYPE",
          title: "Simple<br/>&Bright",
          subtitle: "하단이 박스로 연출되어 있어<span class='bl-in'> </span>심플하고 산뜻한 느낌을 주는 타입입니다."
        }
      ]);
      _step2Motion.init();
      _step3Motion();
      _compareMotion();
      _specMotion.init();
    };
	
    // 스마트웹빌더 모션
    var _builderMotion = function(){
      var $builder = $prRecruit.find(".smart_builder"),
          $titleEng = $builder.find(".title .eng"),
          $titleH2 = $builder.find(".title h2"),
          $titleTxt = $builder.find(".title .txt"),
          $img = $builder.find(".img");

      TweenMax.set($img, {x:-80, y:80});
      TweenMax.set($img.find("img"), {x:-100, y:100});
      TweenMax.set($titleEng, {y:90});
      TweenMax.set($titleH2, {y:100});
      TweenMax.set($titleTxt, {y:100});


      TweenMax.to($builder.find(".mask"), 0.6, {autoAlpha:0.8});
      TweenMax.to($img, 0.3, {autoAlpha:1, delay:0.2});
      TweenMax.to($img, 1.4, {x:0, y:0, ease:"Power2.easeOut", delay:0.2});
      TweenMax.to($img.find("img"), 1.8, {x:0, y:0, ease:"Quint.easeOut", delay:0.2});
      TweenMax.to($titleEng, 1.0, {autoAlpha:1, y:0, ease:"Power1.easeOut", delay:0.2});
      TweenMax.to($titleH2, 1.1, {autoAlpha:1, y:0, ease:"Power1.easeOut", delay:0.3});
      TweenMax.to($titleTxt, 1.1, {autoAlpha:1, y:0, ease:"Power1.easeOut", delay:0.3});
    };
    
    // 스텝1 슬라이드
    var _typeSlide = (function(){
      var $typeSlide,
          $prevSlide, $curSlide, $nextSlide,
          $btnPrev, $btnNext,
          $control;
      var optionArr = [],
          sLength = 0,
          cIdx = 0,         // 현재 노출된 슬라이드 인덱스
          pIdx = 0, 
          nIdx = 0,
          time,       // setTimeout
          initMotion = true;					// 처음 실행 시

      var init = function(optArr){
        $typeSlide = $prRecruit.find(".type_slide");
        $prevSlide = $typeSlide.find(".prev_slide"),
        $curSlide = $typeSlide.find(".cur_slide"),
        $nextSlide = $typeSlide.find(".next_slide"),
        $btnPrev = $typeSlide.find(".btn_prev button"),
        $btnNext = $typeSlide.find(".btn_next button"),
        $control = $typeSlide.find(".control");
        optionArr = optArr,
        sLength = optionArr.length;

        _makeControl();

        _idxCount("go");
        _settingSlide("next");

        // direction button 클릭
        $typeSlide.find(".direction button").click(function(e){
          e.preventDefault();

          if($(this).parent().hasClass("btn_next")){
            _idxCount("next");
            _settingSlide("next");
          }else{
            _idxCount("prev");
            _settingSlide("prev");
          }
        });

        // control button 클릭
        $control.find("button").click(function(e){
          e.preventDefault();

          $(this).parent().addClass("active").siblings().removeClass("active");

          var tempIdx = cIdx;
          cIdx = $(this).parent().index();
          _idxCount("go");

          if(tempIdx < cIdx){
            _settingSlide("next");
          }else if(tempIdx > cIdx){
            _settingSlide("prev");
          }else{
            return false;
          }
        });
      };

      // 자동재생
      var _autoPlay = function(){
        if(time !== undefined) clearTimeout(time);
        time = setTimeout(function(){
          _idxCount("next");
          _settingSlide("next");
        }, 4000);
      };

      // control Button 생성
      var _makeControl = function(){
        var html = "";
        html += "<ul>";
        for(var i=0; i<sLength; i++){
          html += "<li><button type='button'><span class='hidden'>"+i+"</span></button></li>";
        }
        html += "</ul>";
        $control.html(html);
      };

      // Index 카운팅
      var _idxCount = function(dir){
        if(dir === "next"){
          cIdx = cIdx >= sLength-1 ? 0 : cIdx+1;
          pIdx = cIdx <= 0 ? sLength-1 : cIdx-1,
          nIdx = cIdx >= sLength-1 ? 0 : cIdx+1;
        }else if(dir === "prev"){
          cIdx = cIdx <= 0 ? sLength-1 : cIdx-1;
          pIdx = cIdx <= 0 ? sLength-1 : cIdx-1,
          nIdx = cIdx >= sLength-1 ? 0 : cIdx+1;
        }else{          // 처음 실행
          cIdx = cIdx;
          pIdx = cIdx <= 0 ? sLength-1 : cIdx-1,
          nIdx = cIdx >= sLength-1 ? 0 : cIdx+1;
        }
      };

      // 셋팅
      var _settingSlide = function(dir){
        $control.find("li").eq(cIdx).addClass("active").siblings().removeClass("active");
        
        if(initMotion){
        	$curSlide.find(".concept .title").html("<strong class='on'>" + optionArr[cIdx].title + "</strong>");
        	$curSlide.find(".concept .subtitle").html("<strong class='on'>" + optionArr[cIdx].subtitle + "</strong>");
          $curSlide.find(">dl dd").html("<img src='"+optionArr[cIdx].img+"' class='on' alt=''/>");
          $prevSlide.find(">dl dd").html("<img src='"+optionArr[pIdx].img+"' class='on' alt=''/>");
          $nextSlide.find(">dl dd").html("<img src='"+optionArr[nIdx].img+"' class='on' alt=''/>");
        }else{
          $curSlide.find(".concept .title strong.off").remove();
          $curSlide.find(".concept .subtitle strong.off").remove();
          //$curSlide.find(">dl dd img.off").remove();
          //$prevSlide.find(">dl dd img.off").remove();
          //$nextSlide.find(">dl dd img.off").remove();

          $curSlide.find(".concept .title").html("<strong class='on'>" + optionArr[cIdx].title + "</strong>");
          $curSlide.find(".concept .subtitle").html("<strong class='on'>" + optionArr[cIdx].subtitle + "</strong>");
          $curSlide.find(">dl dd").html("<img src='"+optionArr[cIdx].img+"' class='on' alt=''/>");
          $prevSlide.find(">dl dd").html("<img src='"+optionArr[pIdx].img+"' class='on' alt=''/>");
          $nextSlide.find(">dl dd").html("<img src='"+optionArr[nIdx].img+"' class='on' alt=''/>");
        }
        
        $curSlide.find(">dl dt strong").html("<span>"+optionArr[cIdx].name+"</span>");
        $prevSlide.find(">dl dt strong").html("<span>"+optionArr[pIdx].name+"</span>");
        $nextSlide.find(">dl dt strong").html("<span>"+optionArr[nIdx].name+"</span>");
        
        if(dir === "next"){         
          $typeSlide.addClass("next").removeClass("prev");
          $curSlide.find(".concept .title").append("<strong class='off'>" + optionArr[nIdx].title + "</strong>");
        	$curSlide.find(".concept .subtitle").append("<strong class='off'>" + optionArr[nIdx].subtitle + "</strong>");
          //$curSlide.find(">dl dd").append("<img src='"+optionArr[nIdx].img+"' class='off' alt=''/>");
          //$prevSlide.find(">dl dd").append("<img src='"+optionArr[cIdx].img+"' class='off' alt=''/>");
          //$nextSlide.find(">dl dd").append("<img src='"+optionArr[pIdx].img+"' class='off' alt=''/>");
			
        }else{ 
          $typeSlide.addClass("prev").removeClass("next");
          $curSlide.find(".concept .title").append("<strong class='off'>" + optionArr[pIdx].title + "</strong>");
        	$curSlide.find(".concept .subtitle").append("<strong class='off'>" + optionArr[pIdx].subtitle + "</strong>");
          //$curSlide.find(">dl dd").append("<img src='"+optionArr[pIdx].img+"' class='off' alt=''/>");
          //$prevSlide.find(">dl dd").append("<img src='"+optionArr[cIdx].img+"' class='off' alt=''/>");
          //$nextSlide.find(">dl dd").append("<img src='"+optionArr[nIdx].img+"' class='off' alt=''/>");
        }
				
        _motion(dir);
        //_autoPlay();
        initMotion = false;
      };

      var _motion = function(dir){
        TweenMax.killTweensOf($typeSlide.find("dl dd img"));
        TweenMax.killTweensOf($typeSlide.find("dl dt strong span"));
        TweenMax.killTweensOf($typeSlide.find(".concept .title strong"));
        TweenMax.killTweensOf($typeSlide.find(".concept .subtitle strong"));

        if(dir === "next"){
          //TweenMax.set($typeSlide.find("dl dd img.off"), {autoAlpha:0});
          TweenMax.set($typeSlide.find("dl dd img.on"), {x:-50});
          TweenMax.set($typeSlide.find("dl dt strong span"), {x:250});
          TweenMax.set($typeSlide.find(".concept .title strong.off"), {autoAlpha:1, y:0});
          TweenMax.set($typeSlide.find(".concept .subtitle strong.off"), {autoAlpha:1, y:0});
          TweenMax.set($typeSlide.find(".concept .title strong.on"), {y:-200});
          TweenMax.set($typeSlide.find(".concept .subtitle strong.on"), {y:-200});
 
          TweenMax.to($typeSlide.find("dl dd img.on"), 0.5, {autoAlpha:1, x:0, ease:"Power1.easeOut"});
          TweenMax.to($typeSlide.find("dl dt strong span"), 0.6, {autoAlpha:1, x:0, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .title strong.off"), 0.6, {autoAlpha:0, y:200, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .subtitle strong.off"), 0.6, {autoAlpha:0, y:200, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .title strong.on"), 0.6, {autoAlpha:1, y:0, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .subtitle strong.on"), 0.6, {autoAlpha:1, y:0, ease:"Cubic.easeOut"});
        }else{
          //TweenMax.set($typeSlide.find("dl dd img.off"), {autoAlpha:0});
          TweenMax.set($typeSlide.find("dl dd img.on"), {x:50});
          TweenMax.set($typeSlide.find("dl dt strong span"), {x:-250});
          TweenMax.set($typeSlide.find(".concept .title strong.off"), {autoAlpha:1, y:0});
          TweenMax.set($typeSlide.find(".concept .subtitle strong.off"), {autoAlpha:1, y:0});
          TweenMax.set($typeSlide.find(".concept .title strong.on"), {y:200});
          TweenMax.set($typeSlide.find(".concept .subtitle strong.on"), {y:200});
 
          TweenMax.to($typeSlide.find("dl dd img.on"), 0.5, {autoAlpha:1, x:0, ease:"Power1.easeOut"});
          TweenMax.to($typeSlide.find("dl dt strong span"), 0.6, {autoAlpha:1, x:0, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .title strong.off"), 0.6, {autoAlpha:0, y:-200, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .subtitle strong.off"), 0.6, {autoAlpha:0, y:-200, ease:"Cubic.easeOut"});	
          TweenMax.to($typeSlide.find(".concept .title strong.on"), 0.6, {autoAlpha:1, y:0, ease:"Cubic.easeOut"});
          TweenMax.to($typeSlide.find(".concept .subtitle strong.on"), 0.6, {autoAlpha:1, y:0, ease:"Cubic.easeOut"});
        }
      };

      return {
        init: init
      }
    })();
	
    // STEP2 모션
    /*var _step2Motion = {
      $step2: null,
      $tab: null,
      init:function(){
        var _ = this;
        this.$step2 = $prRecruit.find(".step2");
        this.$tab = this.$step2.find(".tab");
        
        _.show(0);
				
        // 탭 클릭 시
        _.$tab.find("a").click(function(e){
          e.preventDefault();
          
          // 현재 on 되어있는 con layer 숨김
        	_.hide(_.$tab.find("li.on").index());
          _.show($(this).parent().index());
        });
      },
      show:function(i){
        var _ = this;
        var $target = _.$step2.find(".tab_con .con[data-index="+i+"]");
        var device = app.mg.device;
        
        _.$tab.find("li").eq(i).addClass("on").siblings().removeClass("on");
        _.$step2.find(".ui li").eq(i).addClass("on").siblings().removeClass("on");
        
        if(device === "desktop"){
          var $layer1 = $target.find(".layer1"),
              $layer2 = $target.find(".layer2");
          
          if($target.children().length > 0) {
            TweenMax.set($layer1, {display:"block", x:-($layer1.width()*0.5), autoAlpha:0});
            TweenMax.to($layer1, 0.5, {autoAlpha:1, x:0, ease:"Cubic.easeOut"});
            
            if($layer2.length > 0){
              TweenMax.set($layer2, {display:"block", x:-($layer2.width()*0.5), autoAlpha:0, delay:0.3});
              TweenMax.to($layer2, 0.5, {autoAlpha:1, x:0, ease:"Cubic.easeOut", delay:0.3});
            }
          }
        }else{
          TweenMax.set($target, {display:"block", autoAlpha:1});
        }
        
      },
      hide:function(i){
				var _ = this;
        var $target = _.$step2.find(".tab_con .con[data-index="+i+"]");
        var device = app.mg.device;
        
        if(device === "desktop"){
          var $layer1 = $target.find(".layer1"),
              $layer2 = $target.find(".layer2");
          
          if($target.children().length > 0) {
            TweenMax.to($layer1, 0.3, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
              TweenMax.set($layer1, {display:"none"});
            }});

            if($layer2.length > 0){
              TweenMax.to($layer2, 0.3, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
                TweenMax.set($layer2, {display:"none"});
              }});
            }
          }
        }else{
          TweenMax.set($target, {display:"none", autoAlpha:0});
        }
      }
    };*/
    
    var _step2Motion = {
      $tab: null,
      $con: null,
      device: "",
      init:function(){
        var _ = this;
        _.$tab = $(".step2 .tab");
        _.$con = $(".step2 .tab_con .con");
        _.device = app.mg.device;

        _.act(0, null);

        _.$tab.find("a").click(function(e){
          e.preventDefault();

          _.device = app.mg.device;
          var pIdx = _.$tab.find("li.on").index(),
              cIdx = $(this).parent().index();

          _.act(cIdx, pIdx);
        });
      },
      act:function(cIdx, pIdx){
        var _ = this;

        if(_.device === "desktop"){
          TweenMax.set(_.$con, {display:"block"});
          _.desktopShow(cIdx, pIdx);
        }else{
          TweenMax.set(_.$con, {display:"none"});
          _.mobileShow(cIdx, pIdx);
        }
      },
      desktopShow:function(cIdx, pIdx){
        var _ = this;
        var $target = _.$con.eq(cIdx),
            $pTarget = _.$con.eq(pIdx),
            $layer1 = $target.find(".layer1"),
            $layer2 = $target.find(".layer2"),
            $pLayer1 = $pTarget.find(".layer1"),
            $pLayer2 = $pTarget.find(".layer2");

        if(pIdx != null){
          _.$tab.find("li").eq(pIdx).removeClass("on");

          if($target.children().length > 0) {
            TweenMax.to($pLayer1, 0.3, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
              TweenMax.set($pLayer1, {display:"none"});
            }});

            if($pLayer2.length > 0){
              TweenMax.to($pLayer2, 0.3, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
                TweenMax.set($pLayer2, {display:"none"});
              }});
            }
          }
        }

        _.$tab.find("li").eq(cIdx).addClass("on");
        TweenMax.set($target, {display:"block"});

        if($target.children().length > 0) {
          TweenMax.set($layer1, {display:"block", x:-($layer1.width()*0.5), autoAlpha:0});
          TweenMax.to($layer1, 0.5, {autoAlpha:1, x:0, ease:"Cubic.easeOut"});

          if($layer2.length > 0){
            TweenMax.set($layer2, {display:"block", x:-($layer2.width()*0.5), autoAlpha:0, delay:0.3});
            TweenMax.to($layer2, 0.5, {autoAlpha:1, x:0, ease:"Cubic.easeOut", delay:0.3});
          }
        }
      },
      mobileShow:function(cIdx, pIdx){
        var _ = this;
        var $target = _.$con.eq(cIdx),
            $pTarget = _.$con.eq(pIdx);

        if(pIdx != null){
          _.$tab.find("li").eq(pIdx).removeClass("on");
          TweenMax.set($pTarget, {display:"none"});
        }

        _.$tab.find("li").eq(cIdx).addClass("on");
        TweenMax.set($target, {display:"block"});
      }
    };
    
    // STEP3 모션
    var _step3Motion = function(){
    	KM({
        eleId: "input_url",
        letter: ["google.recruiter.co.kr"],
        letterTime: 0.04,
        letterDelay: 0.07,
        startDelay: 0.3,
        eraseDelay: 0.3,
        infinite: true,
        slice: true,
        sliceLetter: "#.recruiter.co.kr",
        sliceInsertLetter: ["inair", "naver", "daum", "abcdefg"]
      });
    };
    
    // compare_area motion
    var _compareMotion = function(){
      var $compareArea = $prRecruit.find(".compare_area"),
          $tab = $compareArea.find(".tab"),
          $tabConUl = $compareArea.find(".tab_con>ul");
			
      $tabConUl.on("init", function(){
      	$tabConUl.find("li").css("display", "block");
        _tabOnOff(0);
      });
      
      $tabConUl.slick({
        fade:true,
        slidesToShow:1,
        slidesToScroll:1,
        arrows:true,
        prevArrow:"<button type='button' class='slick-prev'><span class='hidden'>Previous</span></button>",
        nextArrow:"<button type='button' class='slick-next'><span class='hidden'>Next</span></button>",
        dots:false,
        infinite: true,
        autoplay:false,
        autoplaySpeed:3500,
        draggable:false,
        speed:500,
        //cssEase:"cubic-bezier(0.225, 0.625, 0.245, 1.025)",
        cssEase: "ease-out",
        zIndex:80,
        pauseOnHover:false,
        pauseOnFocus:false
      });
      
      $tabConUl.on("beforeChange", function(event, slick, currentSlide, nextSlide){
      	_tabOnOff(nextSlide);
      });

      $tab.find("a").click(function(e){
        e.preventDefault();
        
        $tabConUl.slick("slickGoTo", $(this).parent().index());
      });
      
      function _tabOnOff(i){
      	$tab.find("li").removeClass("on");
        $tab.find("li").eq(i).addClass("on");
      }
    };
    
    // spec_area motion
    var _specMotion = {
    	$specArea: null,
      $btnDetail: null,
      $specLayer: null,
      init:function(){
        var $this = this;
      	$this.$specArea = $prRecruit.find(".spec_area");
        $this.$btnDetail = $this.$specArea.find(".detail button");
        $this.$specLayer = $this.$specArea.find(".spec_layer");
      	
        // layer open
        $this.$btnDetail.click(function(e){
          e.preventDefault();
					
          $this._show();
        });
        
        // layer close
        $this.$specLayer.find(".btn.close").click(function(e){
          e.preventDefault();
					
          $this._hide();
        });
      },
      _show:function(){
        var $this = this;
        TweenMax.set($("body"), {overflow:"hidden"});
        TweenMax.set($this.$specLayer, {display:"block"});
        TweenMax.to($this.$specLayer, 0.4, {autoAlpha:1, ease:"Cubic.easeOut"});
        $this.$specLayer.addClass("open");
      },
      _hide:function(){
        var $this = this;
        TweenMax.set($("body"), {overflow:"inherit"});
        TweenMax.to($this.$specLayer, 0.4, {autoAlpha:0, ease:"Cubic.easeOut", onComplete:function(){
          TweenMax.set($this.$specLayer, {clearProps:"all"});
        }});
        $this.$specLayer.removeClass("open");
      }
    };

    return {
      init:init
    }
  })();
  
  // SelectBox 기능
  app.namespace("selectbox");
  app.selectbox = (function(){
    var Select = function(ele, callback){
    	this.ele = ele;															// selectbox div 영역
      this.callback = callback;										// value list 클릭 시 동작할 콜백함수
      this.focusOut = true;												// focus out 여부
    };
    
    var Fn = Select.prototype;
    
    Fn.init = function(ele, callback){
      var SB = new Select(ele, callback);
      var $ele = SB.ele;
      
      SB._selectSetting();			// rich text 로 받은 li들을 원하는 마크업 형태로 변환
      
      // selectbox 클릭
      $ele.find("dt a").click(function(e){
      	e.preventDefault();
        
        if($ele.hasClass("open")){
        	SB._selectClose();
        }else{
        	SB._selectOpen();
        }
      });
      
      // selectbox value 클릭
      $ele.find("dd li a").click(function(e){
      	e.preventDefault();
        
        var txt = $(this).attr("data-value");
        //$ele.val(txt);
        $ele.find("dt a").text($(this).text());
        SB._selectClose();
        if(SB.callback !== undefined){
        	SB.callback();	
        }
      });
      
      // 포커스 빠졌을 때 selectbox 닫기
      $ele.on({
      	"focusin":function(){
          SB.focusOut = false;
        },
        "focusout":function(){
        	setTimeout(function(){
            if(SB.focusOut){
              SB._selectClose();
            }
          }, 100);
        }
      });
      
      $ele.find("a").on({
      	"focusin":function(){
        	SB.focusOut = false;
        },
        "focusout":function(){
        	SB.focusOut = true;
        }
      });
    };
    
    // select 셋팅
    Fn._selectSetting = function(){
      var $ele = this.ele;
      var html = "";
      
    	if($ele.find("li").length > 0 ){
        html += "<li><a href='#' data-value='all'>" + $ele.find("dt a").text() + "</a></li>";
        $ele.find("li").each(function(i){
          html += "<li><a href='#' data-value='" + $(this).text() + "'>" + $(this).text() + "</a></li>";
        });
        
        $ele.find("dd ul").empty().html(html);
        $ele.val($ele.find("li:first-child a").attr("data-value"));
      }else{
      	alert("Selectbox 값을 정확히 입력하세요.");
      }
    };
    
    // select 펼침
    Fn._selectOpen = function(){
      var $ele = this.ele;
      
    	$ele.addClass("open");
      $ele.find("dd").slideDown(200);	
    };
    
    // select 닫힘
    Fn._selectClose = function(){
      var $ele = this.ele;
      
    	$ele.removeClass("open");
      $ele.find("dd").slideUp(200);
    };
    
  	return Fn.init;
  })();
  
  // Filter 기능
  app.namespace("filter");
  app.filter = (function(){
    var option,										// 필터 및 검색 사용여부 옵션 
    		filterObj = {}, 					// 첫 번째 필터 select box Object
        topicObj = {}, 						// 두 번째 필터 select box Object
        $search,									// search input[type=text]
        $filterCm;								// 아카이브 리스트
   	
    var defaultOption = {
    	filter1: false,						// 첫 번째 필터 사용 여부
      filter1Type: "default",	// default(기본 selecbox) / customize(커스텀 셀렉박스)
      filter2: false,						// 두 번째 필터 사용 여부
      filter2Type: "default",	// default(기본 selectbox) / customize(커스텀 셀렉박스)
      hashtag: false,						// 해시태그 필터 사용여부
      filterTab: false,					// tab 필터 사용여부
      search: false,						// 키워드검색 사용 여부
      searchType: "keyword",		// keyword(회사이름, 타이틀 등 하나의 text) / all
      searchTag: [],					// searchType:all 일 때 filterItem에서 search 될 내용 영역의 태그
      filterItem: null,					// filter 되는 item selector
      filterItemParent: true,        // filter 되는 item selector의 parent를 display:none/block 시키는지 여부
      moreFunc: false						// 더보기 기능 구현되어 있으면 필터 사용했을 때 더보기 풀어버림
    };
    
    var init = function(opt){
     	option = $.extend(defaultOption, opt, {});
      $search = $('#quicksearch');
      $filterCm = option.filterItem;
      $filterCm.addClass('visible-item');
      
      // filter1 사용 - 기본 selecbox 형태
      if(option.filter1 === true && option.filter1Type === "default"){
        filterObj.ele = $('#filter-select');
      	filterObj.initVal = filterObj.ele.val();				// filterObj 초기 value: 'all' (처음 디폴트 밸류가 모든 리스트 선택할 때를 가정으로)
        filterObj.val = filterObj.ele.val();
        
        filterObj.ele.on('change', function(){
          filterObj.val = $(this).val();
          _filterRemote();
        });
      }
      
      // filter1 사용 - 커스터마이징 selecbox 형태
      if(option.filter1 === true && option.filter1Type === "customize"){
        filterObj.ele = $('.style_select#filter1');
      	filterObj.initVal = filterObj.ele.val();				// filterObj 초기 value: 'all' (처음 디폴트 밸류가 모든 리스트 선택할 때를 가정으로)
        filterObj.val = filterObj.ele.val();
        
        filterObj.ele.find("li a").click(function(e){
          e.preventDefault();
          
        	filterObj.ele.val($(this).attr("data-value"));
          filterObj.val = filterObj.ele.val();
          _filterRemote();
        });
      }
      
      // filter2 사용 - 기본 selecbox 형태
      if(option.filter2 === true && option.filter2Type === "default"){
        topicObj.ele = $('.topic-select');
      	topicObj.initVal = topicObj.ele.val();					// filterObj 초기 value: 'all-lp'
        topicObj.val = topicObj.ele.val();					
        
        topicObj.ele.on('change', function(){
          topicObj.val = topicObj.ele.val();
          _filterRemote();
        });
      }
      // filter2 사용 - 커스터마이징 selecbox 형태
      if(option.filter2 === true && option.filter2Type === "customize"){
        topicObj.ele = $('.style_select#filter2');
      	topicObj.initVal = topicObj.ele.val();					// filterObj 초기 value: 'all-lp'
        topicObj.val = topicObj.ele.val();					
        
        topicObj.ele.find("li a").click(function(e){
          e.preventDefault();
          
        	topicObj.ele.val($(this).attr("data-value"));
          topicObj.val = topicObj.ele.val();
          _filterRemote();
        });
      }
      // filterTab 사용 - FAQ 아카이브
      if(option.filterTab){
      	$(".filter_area .tab a").click(function(e){
        	e.preventDefault();
          $(this).parent().addClass("on").siblings().removeClass("on");
          _filterTab($(this).attr("data-tag"));
        });
        _filterTab($(".filter_area .tab li:first-child a").attr("data-tag"));					// 첫번째 탭 실행
      }
      // hashtag 사용
      if(option.hashtag){															// hashtag 기능
         $filterCm.find('.hashtag a').click(function(e){
         	e.preventDefault();
           _hashtag($(this).attr('data-tag'));
         });
      }
      // search 사용
      if(option.search){
        _search();
      	$search.focus(function(){
        	_filterReset('allShow');
        });
      }
    };
    
    // 필터 조정
   	var _filterRemote = function(){
    	if(filterObj.val === filterObj.initVal && topicObj.val === topicObj.initVal){
        _filterReset('reset');
      }else{
        if(option.moreFunc) app.more.allShow();								// 더보기 있을 때 필터나 검색할 때 먼저 모든 아이템 노출시키도록
        _filterAct();
      }
    };
   
    // 필터 동작
    var _filterAct = function(){   
      if($search.val() != "") $search.val("");
    	if(option.filter1 && !option.filter2){								// filter1만 사용할 때
       $filterCm.each(function(i){
         if($(this).attr("data-filter1") === filterObj.val || filterObj.initVal === filterObj.val){
         	$(this).parent().css("display", "block");
         }else{
           $(this).parent().css("display", "none");
         }
       });
      }else if(!option.filter1 && option.filter2){					// filter2만 사용할 때
        $filterCm.each(function(i){
         if($(this).attr("data-filter2") === topicObj.val || topicObj.initVal === topicObj.val){
         	$(this).parent().css("display", "block");
         }else{
           $(this).parent().css("display", "none");
         }
       });
      }else{																								// filter1과 2 둘 다 사용할 때
      	$filterCm.each(function(i){
        	if($(this).attr("data-filter1") === filterObj.val && topicObj.val === topicObj.initVal){						// filter1 값이 같고 filter2는 전체일때
            $(this).parent().css("display", "block");
          }else if(filterObj.val === filterObj.initVal && $(this).attr("data-filter2") === topicObj.val){			// filter1 전체이고 filter2 값이 같을 때
          	$(this).parent().css("display", "block");
          }else if(filterObj.val === filterObj.initVal && topicObj.val === topicObj.initVal){									// filter1 전체이고 filter2도 전체일때
          	$(this).parent().css("display", "block");
          }else if($(this).attr("data-filter1") === filterObj.val && $(this).attr("data-filter2") === topicObj.val){					// filter1 값이 같고 filter2 값이 같을 때
            $(this).parent().css("display", "block");
          }else{
          	$(this).parent().css("display", "none");
          }
        });
      }
    };
    
    // filter 값 초기화
    var _filterReset = function(moreFuncKind){
      if($search.val() != "") $search.val("");
    	if(option.filter1 === true && option.filter2 === true){				
        if(option.filter1Type === "customize" && option.filter2Type === "customize"){
          filterObj.ele.find("dt a").text(filterObj.ele.find("li:first-child a").text());
        	topicObj.ele.find("dt a").text(topicObj.ele.find("li:first-child a").text());
        }
        filterObj.ele.val(filterObj.initVal);
        filterObj.val = filterObj.ele.val();
        topicObj.ele.val(topicObj.initVal);
        topicObj.val = topicObj.ele.val();
        _filterAct();
        $filterCm.find('.hashtag li').removeClass('on');
      }
      
      // 필터 초기화 할 때 더보기 기능 초기화 및 실행 
      if(option.moreFunc){
      	if(moreFuncKind === 'allShow'){
        	app.more.allShow();
        }else{
        	app.more.reset();
        }
      }
    };
    
    // filterTab - FAQ에서 사용
    var _filterTab = function(t){
      var $wrap = $filterCm.parent().parent();
      var length = $filterCm.length;
      
      TweenMax.set($wrap, {display:"none", autoAlpha:0, y:20});
      
      $filterCm.each(function(i){
        if(t === "all"){
        	$(this).parent().css("display", "block");
        }else{
        	if($(this).attr("data-filter1") === t){
            $(this).parent().css("display", "block");
          }else{
            $(this).parent().css("display", "none");
          }
        }
        
        if(i === length-1) {
          TweenMax.set($wrap, {display:"flex"});
          TweenMax.to($wrap, 0.6, {autoAlpha:1, y:0, ease:"Cubic.easeOut"});
          //TweenMax.to($wrap, 0.7, {y:0, ease:"Cubic.easeOut"});
        }
      });
    };
    
    // hashtag
    var _hashtag = function(t){
      if($search.val() != "") $search.val("");
      $filterCm.each(function(i){
         if($(this).attr("data-filter1") === t){
           if(option.filter1Type === "customize"){		// filter1, filter2 텍스트를 해시태그 값으로 바꾸도록
           	filterObj.ele.find("dt a").text(t);
           	topicObj.ele.find("dt a").text(topicObj.ele.find("li:first-child a").text());
           }
           filterObj.ele.val(t);
           topicObj.ele.val(topicObj.initVal);
         	 $(this).parent().css("display", "block");
           $(this).find('.hashtag li').eq(0).addClass('on').siblings().removeClass('on');
         }else if($(this).attr("data-filter2") === t){
           if(option.filter2Type === "customize"){						// filter1, filter2 텍스트를 해시태그 값으로 바꾸도록
           	filterObj.ele.find("dt a").text(filterObj.ele.find("li:first-child a").text());
           	topicObj.ele.find("dt a").text(t);
           }
           filterObj.ele.val(filterObj.initVal);
           topicObj.ele.val(t);
           $(this).parent().css("display", "block");
           $(this).find('.hashtag li').eq(1).addClass('on').siblings().removeClass('on');
         }else{
           $(this).parent().css("display", "none");
         }
       });
    };
    
    // search
    var _search = function(){
      $search = $('#quicksearch');
      $filterCm = option.filterItem;
      
      // 엔터키 눌렀을 때 검색
    	$search.keydown(function(e){
      	if(e.keyCode === 13) _searchAct();
      });
      // 검색 버튼 클릭 시 검색
      $search.siblings(".btn.search").click(function(){
      	_searchAct();
      });
    };
    
    var _searchAct = function(){
      var keyword = $search.val();
      
      if(option.search === true && option.searchType === "keyword"){					// keyword 검색
        $filterCm.each(function(i){
          var $target = (option.filterItemParent === true) ? $(this).parent() : $(this);
          
          if($(this).attr('data-keyword').indexOf(keyword) > -1){
            $target.css("display", "block");
          }else{
            $target.css("display", "none");
          }
        });
      }else if(option.search === true && option.searchType === "all"){		// 리스트 텍스트 검색
      	var filterCmKeyword = [],
        		targetArr = option.searchTag,
            length = targetArr.length;
        
        $filterCm.each(function(i){
        	var $target = (option.filterItemParent === true) ? $(this).parent() : $(this);
          
          for(var j=0; j<length; j++){
        		if($(this).find(targetArr[j]).text().indexOf(keyword) > -1){
              $target.css("display", "block");
              return;
            }else{
            	$target.css("display", "none");
            }
        	}
        });
      }else{
      	console.log("검색할 수 없습니다.");
      }
    };
    
    return {
    	init:init
    }
  })();
  
  // 썸네일 리스트 Hover 모션
  app.namespace('thumbListHover');
  app.thumbListHover = (function(){
    var $filterCm;

    var init = function(ele, type){
      $filterCm = ele;
      $filterCm.on({
        'mouseenter':function(){
          if(type === "play"){
          	TweenMax.to($(this).find(".play_mask"), 0.3, {width:"100%", height:"100%", background:"#005581", autoAlpha:0.3, ease:"Cubic.easeOut"});
            TweenMax.to($(this).find("svg"), 0.3, {scale:1.5, ease:"Cubic.easeOut"});
          }else{					// plus
          	TweenMax.set($(this).find('.thumb a i'), {scale:0.7});
          	TweenMax.to($(this).find('.thumb .mask'), 0.8, {autoAlpha:0.5, ease:'Quint.easeOut'});
          	TweenMax.to($(this).find('.thumb a i'), 0.7, {autoAlpha:1, scale:1, rotation:0.001, ease:'Quint.easeOut'});
          }
          TweenMax.to($(this).find('.thumb figure'), 0.8, {scale:1.1, rotation:0.001, ease:'Quint.easeOut'});
        },
        'mouseleave':function(){
          if(type === "play"){
          	TweenMax.to($(this).find(".play_mask"), 0.3, {width:74, height:47, background:"#25bce8", autoAlpha:0.85, ease:"Cubic.easeOut"});
            TweenMax.to($(this).find("svg"), 0.3, {scale:1, ease:"Cubic.easeOut"});
          }else{					// plus
          	TweenMax.to($(this).find('.thumb .mask'), 0.8, {autoAlpha:0, ease:'Quint.easeOut'});
          	TweenMax.to($(this).find('.thumb a i'), 0.7, {autoAlpha:0, scale:0.7, ease:'Quint.easeOut'});
          }
          TweenMax.to($(this).find('.thumb figure'), 0.8, {scale:1, ease:'Quint.easeOut'});
        }
      });
    };

    return {
    	init:init
    }
  })();
  
  // 더보기 
  app.namespace('more');
  app.more = (function(){
    var $wrap, $item, $btnMore;
    var option,
        showCnt = 0,				// 노출 item 개수
        curCnt = 0,					// 현재 item 개수
        allCnt = 0;					// 총 item 개수
    
    var defaultOption = {
    	moreItemWrap: null,		// 더보기 기능이 구현되어야 할 item을 감싸고 있는 wrapper
    	moreItem: null,				// 더보기 기능이 구현되어야 할 item selector
      showCnt: 9 					// 한 번에 노출할 item 개수
    };
    
  	var init =function(opt){
      option = $.extend(defaultOption, opt, {});
      $wrap = option.moreItemWrap;
      $item = option.moreItem;
      curCnt = 0;
      showCnt = option.showCnt;
      allCnt = $item.length;
      
      if(allCnt > showCnt){					// 총 item 개수가 노출 item 개수보다 많을 때 more 버튼 생성
        _makeMoreBtn();
      }
      _showItem();
    };
    
    // more 버튼 생성 및 이벤트 생성
    var _makeMoreBtn = function(){
      var html = '<div class="btn_area"><button type="button" class="btn more">더보기</button></div>';
    	$wrap.parent().append(html);
      
      $btnMore = $('.btn.more');
      $(document).on('click', '.btn.more', function(){
        if(curCnt >= allCnt) return;
        _showItem();
      });
    };
    
    // item 노출
    var _showItem = function(){
      var maxCnt = curCnt + showCnt;
      if(maxCnt >= allCnt) maxCnt = allCnt;
      
    	for(var i = curCnt; i<maxCnt; i++){
      	//$item.eq(i).css({'display':'block', 'opacity':1});
      	TweenMax.set($item[i], {display:'block'});
      	TweenMax.to($item[i], 0.3, {autoAlpha:1});
      }
      curCnt = curCnt + showCnt;
      if(curCnt >= allCnt){
      	TweenMax.set($btnMore.parent(), {display:'none'});
      }
    };
    
    // more 기능 해제 -> 모든 아이템 노출 및 더보기 버튼 숨김
    var allShow = function(){
    	curCnt = 0;
      /*$item.each(function(i){
      	TweenMax.set($item.eq(i), {display:'block'});
      	TweenMax.to($item.eq(i), 0.3, {autoAlpha:1});
      });*/
      TweenMax.set($item, {display:'block', autoAlpha:1});
      TweenMax.set($btnMore.parent(), {display:'none'});
    };
    
    // more 기능 초기화 -> 초기셋팅 및 더보기 버튼 노출
    var reset = function(){
      TweenMax.set($item, {display:'none', autoAlpha:0});				// $item 스타일 초기화
      TweenMax.set($btnMore.parent(), {display:'block'});
      _showItem();
    };
    
    return {
      init: init,
      allShow: allShow,
      reset: reset
    }
  })();
  
  // 체험하기
  app.namespace("experience");
  app.experience = (function(){
    var $ele;
    var browser;
    
    var init = function(ele, val, type){
      $ele = ele;
      browser = app.mg.browser;
      
      if($ele.hasClass("popup_left")){        // AI면접
        _actLeft(val, type);
      }else{
        
      }
      
      $(".notice_layer button").click(function(e){
        $(".notice_layer").css("display", "none");
        //window.location.reload();
      });
    };
    
    var _actLeft = function(name, type){
      var pName = encodeURIComponent(name),
          code = encodeURIComponent("alkJSD!@F9452M"),
          //url = "https://st-testsvc-company-interview.midasweb.net/resources/js/interview_version2_demo/interview_version2_start.html?sampleName="+pName+"&sampleCertificationCode="+code;
          url;
      
      //domain = type !== "test" ? "https://inair-online.recruiter.co.kr/resources/js/interview_version2_demo/interview_version2_start.html" : "https://st-testsvc-company-interview.midasweb.net/resources/js/interview_version2_demo2/interview_version2.html";
      /*domain = "https://st-testsvc-company-interview.midasweb.net/resources/js/interview_version2_demo2/interview_version2.html";
      url = type !== "exp" ? domain + "?sampleName="+pName+"&sampleCertificationCode="+code : domain;*/
      
      url = type === "exp" ? "https://inair-online.recruiter.co.kr/resources/js/interview_version2_demo2/interview_version2.html" : "https://inair-online.recruiter.co.kr/resources/js/interview_version2_demo/interview_version2_start.html?sampleName="+pName+"&sampleCertificationCode="+code;
      
      var tWindow = window.open(url, "", "");
      if(browser != "Chrome"){
        if(tWindow === null || tWindow.screenLeft === 0){
          //alert("팝업이 차단되었습니다. 팝업을 허용해 주시기 바랍니다."); 
          $(".notice_layer").css("display", "block");
        }else{
          //tWindow = window.open(url, "", "");
          //tWindow.focus();
          if(browser != "IE"){
            window.location.reload();
          }else{
            //location.reload(true);
            history.go(0);
          }
        }
      }else{
        window.location.reload();
      }
      
      /*tWindow = window.open('about:blank', "", "");
      if ( !tWindow ) alert("팝업이 차단되었습니다. 팝업을 허용해 주시기 바랍니다."); 
      else {
        tWindow.close();
        tWindow = window.open(url, "", "");
        tWindow.focus();
        console.log("새창");
      }*/
    };
    
    return {
      init:init
    }
  })();
  
  // HREV Navigation 
  app.namespace("mMenu");
  app.mMenu = (function(){
    var device;
    var $mMenu, $hrevNav, $mNav;

    var init = function(){
      $mMenu = $(".m-menu>a");
      $hrevNav = $(".hrev-nav");

       _setting();
      _act();

      $(window).resize(function(){
        _setting();
      });
    };

    var _setting = function(){
      device = app.mg.device;
      
      if(device != "mobile") return;
      else {
        if($hrevNav.find(".m-nav").length === 0){
          _makeMNav();
        }
      }
    };

    var _makeMNav = function(){
      var $ulClone = $hrevNav.find("ul").clone();
      $ulClone.addClass("m-nav");
      $hrevNav.append($ulClone);
      $mNav = $(".hrev-nav>ul.m-nav");
    };

    var _act = function(){
      $mMenu.click(function(e){
        e.preventDefault();

        if($(this).hasClass("open")){
          $(this).removeClass("open");
          $mNav.slideUp(200);
        }else{
          $(this).addClass("open");
          $mNav.slideDown(200);
        }
      });
    };

    return {
      init:init
    }
  })();

	app.namespace("common.resizeRate");
	app.common.resizeRate = (function(){
		var Setting = function(eleObj, areaObj, ew, eh){
			this.eleObj = eleObj;
			this.areaObj = areaObj;
			this.ew = ew;
			this.eh = eh;

			return this;
		}

		var fn = Setting.prototype;

		fn.init = function(eleObj, areaObj, ew, eh){			// eleObj : 리사이징 될 객체, areaObj : 감싸고 있는 영역 객체
			var Resizing = new Setting(eleObj, areaObj, ew, eh);
			var change;
			
			change = Resizing._calRate(eleObj, areaObj);
			eleObj.css({"width":change.w, "height":change.h, "marginTop":change.mgTop, "marginLeft":change.mgLeft});
		};

		fn._calRate = function(ele, area){
			var $this = this,
					$ele = $this.eleObj, 
					$area = $this.areaObj;
			var eleW = $this.ew,
					eleH = $this.eh,
					originW = $area.width(),					// 감싸는 영역 너비
					originH = $area.height(),					// 감싸는 영역 높이
					eRatio = eleW / eleH,							// 리사이징 될 객체 원래 사이즈 비율
					oRatio = originW / originH,				// 감싸는 영역 비율
					result = {w:0, h:0, mgTop:0, mgLeft:0};

			if(eRatio > oRatio) {
				if(eleW > eleH) {					// 높이가 늘어나야 함			
					result.h = "100%";
					result.w = (originH / eleH) * eleW;
					result.mgLeft = -Math.abs(result.w - originW) / 2;
				}else{										// 너비가 늘어나야 함
					result.w = "100%";
					result.h = (originW / eleW) * eleH;
					result.mgTop = -Math.abs(result.h - originH) / 2;
				}
			}else if(eRatio < oRatio) {
				if(eleW > eleH) {					// 너비가 늘어나야 함
					result.w = "100%";
					result.h = (originW / eleW) * eleH;
					result.mgTop = -Math.abs(result.h - originH) / 2;
				}else{										// 높이가 늘어나야 함	
					result.h = "100%";
					result.w = (originH / eleH) * eleW;
					result.mgLeft = -Math.abs(result.w - originW) / 2;
				}
			}else{
				result.w = "100%";
				result.h = "100%";
			}
			return result;
		};

		return fn.init;
	})();

	//inHR
  app.namespace("inHRevaluation");
  app.inHRevaluation = (function(){
    
    // gnb 
    var gnbControl = (function(){
      var $header;
      var device,
          browserDetect,
          headerH,
          headerFold = true,
          headerStart,            // header 노출 시작 영역 offsettop 값
          headerChangeColor = 0,      // header 색상 바뀌는 시작 영역 offset top 값
          headerStartOffset;
      
      var init = function(){
        $header = app.mg.header;
        device = app.mg.device;
        browserDetect = navigator.userAgent.indexOf("Firefox");
        
        _setting();
        _scroll();
        
        $(window).resize(function(){
          _setting();                 
        });
      };
      if(device === "desktop"){
        headerStartOffset = 200;
      }else if(device == 'tablet'){
        headerStartOffset = 120;
      }else{
        headerStartOffset = 60;
      }
      
      var _setting = function(){
        device = app.mg.device;
        headerH = $header.height();
        headerStart = $(".builder_area").offset().top - headerStartOffset;
      };
      
      var _scroll = function(){
        var tY, prevTY, sTop, prevSTop, browserDelta;

        $(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
          sTop = $(window).scrollTop();

          // mousewheel로 gnb 접고 펼침
          if(headerStart <= sTop){
            // header 접고 펼침
            if(device === "desktop"){                      // desktop 일 때
              if(headerFold === true){  
                _headerShow();
              }
            }else{                                        // tablet, mobile 일 때
              _headerFix();
            }
          }else{
            if(device === "desktop"){
              _headerHide();
            }else{
              _headerFix();
            }
          }
          
          prevSTop = sTop;
        });
      };
      
      // desktop - header 펼침
      var _headerShow = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", y:-(headerH)});
        TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
        headerFold = false;
      };
      
      // desktop - header 접음
      var _headerHide = function(){
        TweenMax.killTweensOf($header);
        TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
          TweenMax.set($header, {display:"none"});
        }});
        headerFold = true;
      };
      
      // tablet, mobile - header 노출 및 고정
      var _headerFix = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", position:"fixed", y:0});
        headerFold = false;
      }; 
      
      return {
        init:init
      }
    })();

    //section01 motion
    var mainVisual ={
      $visualSection:$('.hr_section01'),
      $visualGroup : $(".cont_group"),
      $notebookImg : $('.img_notebook'),
      $hand : $('.img_hand'),
      $puzzleImg : $('.img_puzzle'),
      $personImg : $('.img_person'),
      $handPuzzle : $('.img_puzzle_hand'),
      points : [],
      notebookW : 0,
      init:function(){
        var _=this, 
            viewTop = _.$visualSection.offset().top;
        _.points[0] = viewTop;
        _.points[1] = viewTop + $('.visual01').height(); //빈 div
        _.points[2] = viewTop + $('.visual01').height() + ($('.group01').height() / 2); //group01 반 
        _.points[3] = viewTop + $('.visual01').height() + $('.group01').height(); //group01
        _.points[4] = viewTop + $('.visual01').height() + $('.group01').height() + ($('.group02').height() / 2); //group02 반
        _.points[5] = viewTop + $('.visual01').height() + $('.group01').height() + $('.group02').height(); //group02
        _.points[6] = viewTop + $('.visual01').height() + $('.group01').height() + $('.group02').height() + ($('.group03').height() / 2); //group03 반
        _.points[7] = viewTop + $('.visual01').height() + $('.group01').height() + $('.group02').height() + $('.group03').height(); //group03
        
      },
      act: function(){
        var _=this;
        
        /* section01 진입 */
        if(_.points[0] <= window.pageYOffset){
          _.$visualSection.addClass('active')
        }else if(_.points[7] < window.pageYOffset || window.pageYOffset < _.points[0]){
          _.$visualSection.removeClass('active')
        }
        

        if(window.pageYOffset < _.points[0]){
          
          _.$visualSection.removeClass('scene01')
        }else if(_.points[0] <= window.pageYOffset  && window.pageYOffset < _.points[2]){
          
          _.$visualSection.removeClass('bg02 scene02').addClass('scene01');
        }else if(_.points[2] <= window.pageYOffset && window.pageYOffset < _.points[4]){
          
          _.$visualSection.removeClass('bg03 scene03 scene01').addClass('bg02 scene02');
        }else if( _.points[4] <= window.pageYOffset){
          
          _.$visualSection.removeClass('bg02').addClass('bg03 scene03');
        }
      }
    }
    
   
    //end section01

    var init = function(){
      var $header = app.mg.header;
      gnbControl.init();
      if( app.mg.browser != "IE" && app.mg.device === 'desktop'){
        mainVisual.init();
        mainVisual.act();
      }
      
      scrollDetect.init([{
          ele: $(".builder_area"),
          type: "common",
          duration: 0,
          callback:function(dir, r){
            if(app.mg.device === "desktop"){
              if($header.css("display") === "block") return;
              TweenMax.set($header, {display:"block"});
            }
          }
        }
      ]);
      $(window).on("scroll DOMMouseScroll touchmove", function(e){
        if( app.mg.browser != "IE" && app.mg.device === 'desktop'){
          mainVisual.init();
          mainVisual.act();
        }
      });
      $(window).on("resize", function(e){
        if( app.mg.browser != "IE" && app.mg.device === 'desktop'){
          mainVisual.init();
          mainVisual.act();
        }
      });
      
      
    };
    return {
      init:init
    }
    
  })();




// newsroom Filter 기능
app.namespace("newsroomFilter");
app.newsroomFilter = (function(){
    var option,										// 필터 및 검색 사용여부 옵션 
        filterObj = {}, 					// 첫 번째 필터 select box Object
        topicObj = {}, 						// 두 번째 필터 select box Object
        $search,									// search input[type=text]
        $filterCm,								// 아카이브 리스트
        categoryObj = {},
        $filterCateList;
       
    var defaultOption = {
        filter1: false,						// 첫 번째 필터 사용 여부
        filter2: false,						// 두 번째 필터 사용 여부
        hashtag: false,						// 해시태그 필터 사용여부
        filterTab: false,					// tab 필터 사용여부
        search: false,						// 키워드검색 사용 여부
        searchType: "all",		// keyword(회사이름, 타이틀 등 하나의 text) / all
        searchTag: [],					// searchType:all 일 때 filterItem에서 search 될 내용 영역의 태그
        filterItem: null,					// filter 되는 item selector
        filterItemParent: false,        // filter 되는 item selector의 parent를 display:none/block 시키는지 여부
        moreFunc: false,					// 더보기 기능 구현되어 있으면 필터 사용했을 때 더보기 풀어버림
        filterCategory : false,
        filterCateList : null
    };
    
    var init = function(opt){
        option = $.extend(defaultOption, opt, {});
        $search = $('#quicksearch');
        $filterCm = option.filterItem;
        $filterCm.addClass('visible-item');
        $filterCateList = option.filterCateList;
          
        // filter1 사용 
        if(option.filter1 === true){
            _filterSet(filterObj,'#filter1');
        }
        
        // filter2 사용
        if(option.filter2 === true){
            _filterSet(topicObj,'#filter2');
        }

        // 주제 필터 사용 
        if(option.filterCategory === true){
            _filterSet(categoryObj,'#filterCategory');
        }
        // search 사용
        if(option.search){
            _search();
            $search.focus(function(){
                _filterReset('allShow');
                $filterCateList.each(function(){
                    $(this).css('display','block');
                });
            });
        }
        if($filterCateList !== null){
           _setCateData();
        }
    };

    var _filterSet = function(obj, filterBoxID){
        obj.ele = $(filterBoxID);;
        obj.iniVal = obj.ele.val();
        obj.val = obj.ele.val();
        obj.ele.find("li a").click(function(e){
            e.preventDefault();
            obj.ele.val($(this).attr("data-value"));
            obj.val = obj.ele.val();
            _filterRemote();
        })
        
    };
    //category data attr setting
    var _setCateData = function(){
        $filterCateList.each(function(){
            var cate = $(this).find(".news_category span").text();
            $(this).attr('data-cate', cate);
        })
    };

    
    // 필터 조정
    var _filterRemote = function(){
        $search.val('');
        //if(option.search === true )_searchReset()
        if(filterObj.val === filterObj.iniVal && topicObj.val === topicObj.iniVal && categoryObj.val === categoryObj.iniVal){
            _filterReset('reset');
        }else{
            if(option.moreFunc) app.newsroomMore.allShow();								// 더보기 있을 때 필터나 검색할 때 먼저 모든 아이템 노출시키도록
            _filterAct();
        }
    };

   
    // 필터 동작
    var _filterAct = function(){
        if(option.search === true ){_searchReset()}
        app.newsroomMore.allShow();
        $filterCm.each(function(i){
             if(categoryObj.val !== categoryObj.iniVal || filterObj.val !== filterObj.iniVal || topicObj.val !== topicObj.iniVal){
                if(categoryObj.val !== categoryObj.iniVal){
                    //if($(this).attr('data-filter-cate') === 'on'){$(this).attr('data-filter-cate','')}
                    /*$filterCateList.each(function(){
                        $(this).css('display','block');
                        if($(this).find('.news_category span').is(":contains("+ categoryObj.val+")")){
                            $(this).css('display','block');
                            //$(this).closest('.month_wrap').attr('data-filter-cate','on');
                        }else{
                            $(this).css('display','none');
                        }
                    });*/
                  
                    if($(this).find('.news_category span').is(":contains("+ categoryObj.val+")")){
                        if($(this).attr("data-filter1") === filterObj.val && topicObj.val === topicObj.iniVal){						// filter1 값이 같고 filter2는 전체일때
                            $(this).css("display", "block");
                        }else if(filterObj.val === filterObj.iniVal && $(this).attr("data-filter2") === topicObj.val){			// filter1 전체이고 filter2 값이 같을 때
                            $(this).css("display", "block");
                        }else if($(this).attr("data-filter1") === filterObj.val && $(this).attr("data-filter2") === topicObj.val){					// filter1 값이 같고 filter2 값이 같을 때
                            $(this).css("display", "block");
                        }else if(filterObj.val === filterObj.iniVal && topicObj.val === topicObj.iniVal){					// filter1 =초기값, filter2 = 초기값
                            $(this).css("display", "block");
                        }else{
                            $(this).css('display','none');
                        }
                    } 
                    else $(this).css('display','none')
                }else{
                    if($(this).attr("data-filter1") === filterObj.val && topicObj.val === topicObj.iniVal){						// filter1 값이 같고 filter2는 전체일때
                        $(this).css("display", "block");
                    }else if(filterObj.val === filterObj.iniVal && $(this).attr("data-filter2") === topicObj.val){			// filter1 전체이고 filter2 값이 같을 때
                        $(this).css("display", "block");
                    }else if($(this).attr("data-filter1") === filterObj.val && $(this).attr("data-filter2") === topicObj.val){					// filter1 값이 같고 filter2 값이 같을 때
                        $(this).css("display", "block");
                    }else{
                        $(this).css("display", "none");
                    }
                }
            }else if(filterObj.val === filterObj.iniVal && topicObj.val === topicObj.iniVal && categoryObj.val === categoryObj.iniVal ){
                app.newsroomMore.reset();
            }else{
                //$(this).css("display", "none");
                console.log('no')
            }
        });
    };
    
    // filter 값 초기화
    var _filterReset = function(moreFuncKind){
        if($search.val() != "") $search.val("");
        if(option.filter1 === true && option.filter2 === true && option.filterCategory === true){				
            filterObj.ele.find("dt a").text(filterObj.ele.find("li:first-child a").text());
            topicObj.ele.find("dt a").text(topicObj.ele.find("li:first-child a").text());
            categoryObj.ele.find("dt a").text(categoryObj.ele.find("li:first-child a").text());
            filterObj.ele.val(filterObj.iniVal);
            filterObj.val = filterObj.ele.val();
            topicObj.ele.val(topicObj.iniVal);
            topicObj.val = topicObj.ele.val();
            categoryObj.ele.val(categoryObj.iniVal);
            categoryObj.val = categoryObj.ele.val();
            _filterAct();
        }
      
        // 필터 초기화 할 때 더보기 기능 초기화 및 실행 
        if(option.moreFunc){
            if(moreFuncKind === 'allShow'){
                app.newsroomMore.allShow();
            }else{
                app.newsroomMore.reset();
            }
        }
    };
    
    
    // search
    var _search = function(){
      $search = $('#quicksearch');
      $filterCm = option.filterItem;
      
      // 엔터키 눌렀을 때 검색
        $search.keydown(function(e){
          if(e.keyCode === 13) _searchAct();
      });
      // 검색 버튼 클릭 시 검색
      $search.siblings(".btn.search").click(function(){
          _searchAct();
      });
    };
    
    var _searchReset = function(){
        $searchWrap = $('.search_item');
        $searchWrap.each(function(){
            $(this).attr('data-search','');
            $(this).removeClass('search_result');
            if(option.filterItemParent === true) $(this).parent().remove('search_result');
        })
      
    }
    var _searchAct = function(){
        var keyword = $search.val();
        $searchWrap = $('.search_item');
        _searchReset();
        if(option.search === true ){					// keyword 검색
            $searchWrap.each(function(){
                //title, category, sub txt에서 keyword 검색
                if($(this).find('.news_category span').is(":contains("+ keyword+")") || $(this).find('.news_tit').is(":contains("+ keyword+")") || $(this).find('.news_txt span').is(":contains("+ keyword+")") || $(this).find('.news_txt p').is(":contains("+ keyword+")") ){
                    $(this).attr('data-search','on')
                    /*if($(this).closest(".month_wrap")){
                        $(this).closest(".month_wrap").addClass("has_result");
                    }*/
                }else{
                  /*if($(this).closest(".month_wrap")){
                      $(this).closest(".month_wrap").addClass("no_result");
                  }*/
                }
            });
            $searchWrap.each(function(){
                if($(this).attr('data-search') !== 'on'){
                    if(option.filterItemParent === true) $(this).parent().addClass('search_result');
                    else $(this).addClass('search_result');
                }
            });
        }else{
            console.log("검색할 수 없습니다.");
        }
    };
    
    return {
        init:init
    }
  })();

  // 더보기 
  app.namespace("newsroomMore");
  app.newsroomMore = (function(){
      var $wrap, $item, $btnMore;
      var option,
          showCnt = 0,				// 노출 item 개수
          curCnt = 0,					// 현재 item 개수
          allCnt = 0,					// 총 item 개수
          defaultCnt = 0; 

      var defaultOption = {
          moreItemWrap: null,		// 더보기 기능이 구현되어야 할 item을 감싸고 있는 wrapper
          moreItem: null,				// 더보기 기능이 구현되어야 할 item selector
          showCnt: 9 					// 한 번에 노출할 item 개수
      };

      var init =function(opt){
          option = $.extend(defaultOption, opt, {});
          $wrap = option.moreItemWrap;
          $item = option.moreItem;
          defaultCnt = option.default;
          showCnt = option.showCnt;
          allCnt = $item.length;
          curCnt = defaultCnt;
          setMakeBtn();
          _showItem(defaultCnt);
      };
      var setMakeBtn = function(){
        var html = '<div class="news_btn_wrap newsroom"><div class="inner"><div class="btn_area"><button type="button" class="btn_more"><span>보도자료 더보기</span></button></div></div></div>';
        $wrap.parent().append(html);
        $btnMore = $('.btn_more');
        $btnMore.parent().hide();
        if(allCnt > curCnt){					// 총 item 개수가 노출 item 개수보다 많을 때 more 버튼 생성
            TweenMax.set($btnMore.parent(), {display:'block'});
            _makeMoreBtn();
        }
      }
      // more 버튼 생성 및 이벤트 생성
      var _makeMoreBtn = function(){
          $(document).on('click', '.btn_more', function(){
              if(curCnt >= allCnt) return;
              _showItem();
          });
      };

      // item 노출
      var _showItem = function(cnt){
          //var maxCnt = curCnt + showCnt;
          var maxCnt;
          if(!cnt) {curCnt = curCnt + showCnt;maxCnt = curCnt;}
          else {maxCnt = cnt;curCnt = cnt}
          if(maxCnt >= allCnt) maxCnt = allCnt;

          for(var i = 0; i< maxCnt; i++){
              //$item.eq(i).css({'display':'block', 'opacity':1});
              TweenMax.set($item[i], {display:'block'});
              TweenMax.to($item[i], 0.3, {autoAlpha:1});
          }

          if(curCnt >= allCnt){
              TweenMax.set($btnMore.parent(), {display:'none'});
          }
      };

      // more 기능 해제 -> 모든 아이템 노출 및 더보기 버튼 숨김
      var allShow = function(){
          curCnt = 0;
          TweenMax.set($item, {display:'block', autoAlpha:1});
          TweenMax.set($btnMore.parent(), {display:'none'});
      };

      // more 기능 초기화 -> 초기셋팅 및 더보기 버튼 노출
      var reset = function(){
        //console.log("more reset")
          TweenMax.set($item, {display:'none', autoAlpha:0});				// $item 스타일 초기화
          TweenMax.set($btnMore.parent(), {display:'block'});
          _showItem(defaultCnt);
      };

      return {
          init: init,
          allShow: allShow,
          reset: reset
      }
  })();

  // 제품 안내 sub 네비게이션 - 모바일
  app.namespace("forBizNavi");
  app.forBizNavi = (function(){
    var $mainNavi = $('#header');
    var $navi = $('.business_layout').find('.forbiz_menu'),
        $current = $navi.find('.current').find('a'),
        $menuList = $navi.find('.menu')

    var device;
    
    var init = function(){
      var originTxt = $current.text();
      var $btnHam = $mainNavi.find(".btn_ham");
      $current.click(function(e){
        e.preventDefault();
        if($navi.hasClass('open')){
          $current.text(originTxt);
          $menuList.slideUp(300);
          $navi.removeClass('open');
        }else{
          $current.text('제품 안내');
          $menuList.slideDown(300);
          $navi.addClass('open')
        }
      });
      // gnb 접음
      var tY, prevTY, sTop, prevSTop, 
          headerH, 
          browserDelta, 
          browserDetect = navigator.userAgent.indexOf("Firefox"),
          gnbFold = false;
      var $target;
      
      $(window).on("scroll DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
        if(device != "desktop" && $btnHam.attr("data-open") === "true") return;
       
        $target = $navi;
        headerH = $mainNavi.height();
        sTop = $(window).scrollTop();

        if(e.type === "touchmove"){
          tY = e.originalEvent.touches[0].clientY;
          if(tY > prevTY){
            browserDelta = 1;
          }else{
            browserDelta = -1;
          } 
          prevTY = tY;
        }else{
          
        }
        if(e.type === "scroll" || e.type === "DOMMouseScroll" || e.type === "touchmove"){
          if(browserDelta > 0 || sTop < prevSTop){
            if(gnbFold === true){               // gnb 펼침
              TweenMax.killTweensOf($mainNavi);
              TweenMax.set($mainNavi, {display:"block"});
              TweenMax.to($mainNavi, 0.2, {y:0});
              TweenMax.to($target, 0.2, {y:0});
              gnbFold = false;
            }
          }else{
            if(gnbFold === false){
              TweenMax.killTweensOf($mainNavi);
              TweenMax.to($mainNavi, 0.2, {y:-(headerH), onComplete:function(){
                TweenMax.set($mainNavi, {display:"none"});
              }});
              TweenMax.to($target, 0.2, {y:-(headerH)});
              gnbFold = true;
            }
          }
        }

        prevSTop = sTop;
      });
    }
    
    return {
      init:init
    }
  })();
  
  // jobflex ai역량- G/S
  app.namespace("jobflexAbility");
  app.jobflexAbility = (function(){    
    // 반응형 분기 처리
    var responsive = (function(){
      var $p6Video, $logoArea;
      var device, prevDevice, browser;
     
      var src = {
        /* introVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/start.mp4",
        introIEVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/inAIR_ex_2.mp4", */
        dashboardImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/dashboard_img.jpg",
        introLightVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/light3.mp4",
        darkImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/process_large_dark.jpg",
        darkMImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/process_large_dark.jpg",
        p6Video: "https://fs.hubspotusercontent00.net/hubfs/4570750/inAIR/video/renewal/p6_renewal.mp4",
        p6MVideo: "https://fs.hubspotusercontent00.net/hubfs/4570750/inAIR/video/renewal/p6_renewal_m.mp4",
        logoImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/story_logo.jpg",
        logoMImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/story_logo.jpg"
      };
     
      var init = function(){
        device = app.mg.device;
        browser = app.mg.browser;
        /* $introVideo = $(".intro_area .video_area");
        $introFigure = $(".intro_area .text_area figure");
        $introLight = $(".intro_area .light_m");
        $processDark = $(".process_intro .dark"); */
        $p6Video = $(".p6_area video");
        $logoArea = $(".customer_area .logo_area");
       
        _setting();
       
        $(window).resize(function(){
          prevDevice = device;
          device = app.mg.device;
          browser = app.mg.browser;
         
          if(device !== prevDevice) _setting();
        });
       
        prevDevice = device;
      };
     
      var _setting = function(){
        if(device === "desktop"){
          _desktop();
        }else{
          _mobile();
        }
      };
     
      var _desktop = function(){
        $p6Video.attr("src", src.p6Video);
        $logoArea.html("<img src='"+src.logoImg+"' alt=''>");
      };
     
      var _mobile = function(){
        if(device === "tablet"){
          $p6Video.attr("src", src.p6Video);
        }else{
          $p6Video.attr("src", src.p6MVideo);
        }
        $logoArea.html("<img src='"+src.logoMImg+"' alt=''>");
      };
     
      return{
        init:init
      }
    })();
   
    // gnb
    var gnbControl = (function(){
      var $header;
      var device,
          browserDetect,
          headerH,
          headerFold = true,
          headerStart = 0,            // header 노출 시작 영역 offsettop 값
          headerChangeColor = 0;      // header 색상 바뀌는 시작 영역 offset top 값
     
      var init = function(){
        $header = app.mg.header;
        device = app.mg.device;
        browserDetect = navigator.userAgent.indexOf("Firefox");
       
        _setting();
        _scroll();
       
        $(window).resize(function(){
          _setting();                
        });
      };
     
      var _setting = function(){
        device = app.mg.device;
        headerH = $header.height();
        headerStart = $(".process_area").offset().top - 120;
        headerChangeColor = $(".p6_area").offset().top;
      };
     
      var _scroll = function(){
        var tY, prevTY, sTop, prevSTop, browserDelta;

        $(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
          sTop = $(window).scrollTop();

          // mousewheel 브라우저 분기 처리
          /*if(e.type === "touchmove"){
            tY = e.originalEvent.touches[0].clientY;
            if(tY > prevTY){
              browserDelta = 1;
            }else{
              browserDelta = -1;
            }
            prevTY = tY;
          }else{
            if(browserDetect > -1){ // firefox
              browserDelta = e.originalEvent.detail * -1; // firefox에선 스크롤 올리면 (-), 내리면 (+). wheelDelta랑 맞추기 위해 -1 곱함  
            }else{ // 나머지 브라우저
              browserDelta = e.originalEvent.wheelDelta;
            }
          }*/

          // mousewheel로 gnb 접고 펼침
          if(headerStart <= sTop){
            // header 접고 펼침
            if(device === "desktop"){                      // desktop 일 때
              if(headerFold === true){  
                _headerShow();
              }
            }else{                                        // tablet, mobile 일 때
              _headerFix();
            }
           
          }else{
            if(device === "desktop"){
              _headerHide();
            }else{
              _headerMHide();
            }
          }
         
          prevSTop = sTop;
        });
      };
     
      // desktop - header 펼침
      var _headerShow = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", y:-(headerH)});
        TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
        headerFold = false;
      };
     
      // desktop - header 접음
      var _headerHide = function(){
        TweenMax.killTweensOf($header);
        TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
          TweenMax.set($header, {display:"none"});
        }});
        headerFold = true;
      };
     
      // tablet, mobile - header 노출 및 고정
      var _headerFix = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", position:"fixed", y:0});
        headerFold = false;
      };
     
      // tablet, mobile - header 숨김
      var _headerMHide = function(){
        TweenMax.killTweensOf($header);
        //TweenMax.set($header, {display:"none", position:"absolute"});
        TweenMax.set($header, {display:"none"});
        headerFold = true;
      };
     
      return {
        init:init
      }
    })();
   
   
    // 뉴스 반응형일 때 슬라이드로 변환
    var newsMobileSlide = (function(){
      var $newsUl;
      var device, prevDevice;
     
      var init = function(){
        $newsUl = $(".news_area ul.slides");
        //device = app.mg.device;
       
        _act();
        $(window).resize(function(){
          _act();
        });
      };
     
      var _act = function(){
        device = app.mg.device;
        if(device != prevDevice) {
          if(device === "mobile"){
            $newsUl.not(".slick-initialized").slick({
              fade:true,
              slidesToShow:1,
              slidesToScroll:1,
              arrows:false,
              dots:true,
              infinite: false,
              autoplay:true,
              autoplaySpeed:3500,
              draggable:false,
              speed:300,
              
            });
          }else{
            if($newsUl.hasClass("slick-initialized")){
              $newsUl.slick("unslick");
            }
          }
        }    
       
        prevDevice = device;
      };
     
      return {
        init:init
      }
    })();
   
   /*
        AI-사람 대화 UI
        array = [{st: start time, rapid: motion rapid (한번 튕길 때 속도), repeat: repeat num (반복수는 문장의 단어 수만큼)}]
     */
    var aiHumanCom = (function(){
        var $comCon, $txtHuman, $txtAi, $aiShape, $circle, $mask;
        var hmArr = [],                         // 사람 멘트 array
            amArr = [],                         // ai 멘트 array
            asArr = [],                         // ai shape 정보 array
            curIdx = 0,                         // 현재 ai-사람 멘트 index
            aihumanDelay = 0.7,                 // ai랑 사람 멘트 사이 딜레이
            nextDelay = 1.4,                    // 다음 멘트세트 시작 딜레이
            device,
            t;


        var init = function(h, a, as){           // 사람멘트, ai멘트, ai shape 모션 정보
          $comCon = $(".com_con");
          $txtHuman = $comCon.find(".txt.human");
          $txtAi = $comCon.find(".txt.ai");
          $aiShape = $comCon.find(".ai_shape");
          $circle = $comCon.find(".circle");
          $mask = $comCon.find(".mask");
          device = app.mg.device;

          hmArr = h;
          amArr = a;
          asArr = as;

          _controlMotion();
         
          $(window).resize(function(){
            device = app.mg.device;
          });
        };

        // 전체 모션 컨트롤
        var _controlMotion = function(){
            if(curIdx >= hmArr.length){
                curIdx = 0;
            }

            _aiTyping(amArr[curIdx]);
            //_humanCom(hmArr[curIdx]);
            _pulseMotion(asArr[curIdx]);
        };

        // ai 타이핑 모션
        var _aiTyping = function(txt){
          var w = 0;

          TweenMax.set($txtAi, {display:"block"});
          TweenMax.to($txtAi, 0.5, {autoAlpha:1, ease:"Cubic.easeOut"});
         
          if(device === "mobile"){
            TweenMax.set($mask, {display:"block", autoAlpha:0});
            TweenMax.to($mask, 0.4, {autoAlpha:0.7, ease:"Quad.easeOut"});
            TweenMax.to($aiShape, 0.3, {autoAlpha:1, ease:"Cubic.easeOut"});
          }else{
            TweenMax.set($mask, {display:"none"});
            TweenMax.set($aiShape, {display:"block", autoAlpha:1});
          }

          KM({
              eleId: "txt_ai",
              letter: new Array(txt),
              letterTime: 0.03,
              letterDelay: 0.06,
              cursorEnd: false,
              callback: function(i, length){
                if($txtAi.find(".letter").eq(i).width() === 0){
                  w += $txtAi.find(".letter").eq(0).width() * 0.5;
                }else{
                  w += $txtAi.find(".letter").eq(i).width();
                }
                //w += $txtAi.find(".letter").eq(i).width() + 2;
                TweenMax.to($txtAi.find(".typing_area"), 0.03, {width:w, ease:"Quad.easeInOut"});
                TweenMax.to($txtAi, 0.03, {x:-w*0.5, ease:"Quad.easeInOut"});

                if(i === length-2){
                  if(device === "mobile"){
                    TweenMax.to($aiShape, 0.4, {autoAlpha:0, ease:"Expo.easeOut", delay:aihumanDelay});
                    TweenMax.to($mask, 0.4, {autoAlpha:0, ease:"Expo.easeOut", delay:aihumanDelay, onComplete:function(){
                      TweenMax.set($mask, {display:"none"});
                    }});
                  }
                  TweenMax.to($txtAi, 0.3, {autoAlpha:0, ease:"Quad.easeOut", delay:aihumanDelay, onComplete:function(){
                    TweenMax.set($txtAi, {clearProps:"all"});
                    _humanCom(hmArr[curIdx]);
                  }});
                }
              }
          });
        };

        // 사람 말풍선 모션
        var _humanCom = function(txt){
          var x;
         
          $txtHuman.text(txt);          
          $aiShape.removeClass("on");
         
          if(device === "desktop"){
            x = -(350+$txtHuman.width()*0.5);
          }else{
            x = -$txtHuman.width()*0.5;
          }

          TweenMax.set($txtHuman, {display:"block", height:0, scale:0.7, x:x});            // 중앙선과 사람 가운데까지 거리 : 350px
          TweenMax.to($txtHuman, 0.5, {autoAlpha:1, scale:1, height:43, ease:"Power3.easeInOut"});
          TweenMax.to($txtHuman, 0.5, {autoAlpha:0, ease:"Power3.easeInOut", delay:nextDelay, onComplete:function(){
              TweenMax.set($txtHuman, {display:"none"});
              curIdx++;
              _controlMotion();
          }});
        };

        // ai shape 모션
        var _pulseMotion = function(v){
            var firstRate = 1.02,
                repeatRate = 1.01;
            var t = new TimelineMax({repeat:v.repeat, repeatDelay:v.repeatDelay});
         
          $aiShape.addClass("on");
            t.kill();
            t.to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:firstRate, ease:"Quad.easeIn"})
            .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:1.03, ease:"Quad.easeInOut"})
            .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:repeatRate, ease:"Quad.easeIn"})
            .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:1, ease:"Quad.easeInOut"});
        };

        return{
            init:init
        }
    })();
   
    // V4 영상 음소거 on/off
    var v4VideoMute = function(){
      var $techArea = $(".tech_area"),
          $btnMute = $techArea.find("button");
      var vInfo = [];
     
      for(var i=0; i<$btnMute.length; i++){
      vInfo[i] = {
          btn: $btnMute.eq(i),
        video: document.getElementById($btnMute.eq(i).data("target")),
          onoff: "off"
        };
      }
     
      $btnMute.click(function(e){
      e.preventDefault();
       
        var idx = $(this).data("index");
        if(vInfo[idx].onoff === "off"){ // 소리가 꺼져있을 때
          for(var j=0; j<vInfo.length; j++){ // 다른 영상 소리 켜져있으면 끄도록
if(!vInfo[j].video.muted) off(j);
          }
          on(idx);
        }else{
          off(idx);
        }
      });
     
      function on(i){
      if(vInfo[i].video.muted) vInfo[i].video.muted = false;
      vInfo[i].btn.attr("class", "on").find(".hidden").text("ON");
        vInfo[i].onoff = "on";
      }
   
    function off(i){
      if(!vInfo[i].video.muted) vInfo[i].video.muted = true;
        vInfo[i].btn.attr("class", "off").find(".hidden").text("OFF");
        vInfo[i].onoff = "off";
      }
    };
   
    // graph 모션
    var graphDraw = (function(){
      var $graphWrap, $graph, $target;
      var targetArr = [],
          num = 0,
          motionReady = true,
          prevDevice,
          browser;

      var init = function(){
        $graphWrap = $(".graph_wrap");
        $graph = $("#graph_path");
        $target = $graph.find("polyline");
        browser = app.mg.browser;
       
        _act();
      };
     
      var _act = function(){
        if(motionReady === false || app.mg.device != "desktop" || browser === "IE") return;
       
        var $mark = $graphWrap.find(".mark");
        var partCnt = 4,
            motionTime = 1.2;
            leng = $target[0].getTotalLength();


        $target.css({"stroke-dasharray":leng + "," + leng, "stroke-dashoffset":leng});
        var t = TweenMax.to($target, motionTime, {strokeDashoffset:0, ease:"Quad.easeOut"});

        TweenMax.set($mark, {display:"block", y:-10});
        TweenMax.set($mark.eq(3), {scale:0.8});

        TweenMax.to($mark.eq(0), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.2});
        TweenMax.to($mark.eq(1), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.4});
        TweenMax.to($mark.eq(2), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.6});
        TweenMax.to($mark.eq(3), 0.4, {autoAlpha:1, y:0, rotationY:360, ease:"Cubic.easeOut", delay:1.0});
       
        motionReady = false;
      };

      return {
        init:init
      }
    })();

// pc에서만 슬라이드
    var pcSlide = (function(){
      var $gTechSlide, $reportSlide;
      var device, prevDevice;
     
      var init = function(){
        $gTechSlide= $(".slider.g_tech"),
        $reportSlide = $(".slider.report_cont");
        //device = app.mg.device;
       
        _act();
        $(window).resize(function(){
          _act();
        });
      };
     
      var _act = function(){
        device = app.mg.device;
        if(device != prevDevice) {
          if(device === "desktop"){
            $gTechSlide.not(".slick-initialized").slick({
              infinite: false,
              slidesToShow: 1,
              slidesToScroll: 1,
            });
            $reportSlide.not(".slick-initialized").slick({
              infinite: false,
              slidesToShow: 1,
              variableWidth: true,
              slidesToScroll: 1,
              dots:true,
            });
          }else{
            if($gTechSlide.hasClass("slick-initialized")){
              $gTechSlide.slick("unslick");
            }
            if($reportSlide.hasClass("slick-initialized")){
              $reportSlide.slick("unslick");
            }
          }
        }    
       
        prevDevice = device;
      };
     
      return {
        init:init
      }
    })();
   
    //--------------------------------- inairAI 실행 코드----------------------------------------------------//
    var init = function(){
      var browser = app.mg.browser;
      if(browser === "IE") $("#wrap").find('.graph_wrap').addClass("ie");
     
      // 로딩 화면
    TweenMax.to($(".full_loading"), 0.3, {autoAlpha:0, onComplete:function(){
        TweenMax.set($(".full_loading"), {display:"none"});
      }});
     
      gnbControl.init();
     
      newsMobileSlide.init();     // 뉴스 반응형 슬라이드 교체
      pcSlide.init();
      // ai-사람 대화
      aiHumanCom.init(
          ["안녕하세요. 마케팅파트에 지원한 이지혜입니다", "지식도 중요하지만 무엇보다 실무 경험이라 생각합니다", "고객의 요구에 유연하게 대응해야 하기 때문입니다", "대학생 때 마케팅 관련 대외활동과 인턴 경험이 있습니다", "우수 인턴으로 선정되어 해외 연수를 다녀온 일입니다"],     // 사람 멘트
          ["반갑습니다. 이지혜님. AI역량검사에 오신 것을 환영합니다", "마케팅에 있어 가장 중요한 것은 무엇인가요?", "실무 경험이 중요한 이유는 무엇인가요?", "관련 실무 경험이 있으신가요?", "인턴 경험 때 가장 기억에 남는 일은 무엇인가요?"],                // ai 멘트
          [{rapid:0.1, repeat:5, repeatDelay:0.05},
          {rapid:0.08, repeat:4, repeatDelay:0.05},
          {rapid:0.08, repeat:4, repeatDelay:0.05},
          {rapid:0.08, repeat:4, repeatDelay:0.05},
          {rapid:0.08, repeat:5, repeatDelay:0.05}
          ]
      );
     
      // graph 모션
      scrollDetect.init([{
        ele: $(".graph_wrap"),
        type: "common",
        duration: 0,
        callback:function(dir, r){
          graphDraw.init();
        }
      }]);
     
      // v4 영상 음소거
      v4VideoMute();
     
      // 가로 스크롤 초기화
      //reportScroll.init();
    };
   
    // inairAI return
  return {
    init:init,
      responsive:responsive
    }
   
    //--------------------------------- jobflex-ability 실행 코드----------------------------------------------------//
  })();

  //jobflex 언택트
  app.namespace("jobflexUntact");
  app.jobflexUntact = (function(){    
    // 반응형 분기 처리
    var responsive = (function(){
      var device, prevDevice, browser;
     
      var init = function(){
        device = app.mg.device;
        browser = app.mg.browser;
        
        $(window).resize(function(){
          prevDevice = device;
          device = app.mg.device;
          browser = app.mg.browser;
        });
       
        prevDevice = device;
      };
     
      return{
        init:init
      }
    })();
   
    // gnb
    var gnbControl = (function(){
      var $header;
      var device,
          browserDetect,
          headerH,
          headerFold = true,
          headerStart = 0,            // header 노출 시작 영역 offsettop 값
          headerChangeColor = 0;      // header 색상 바뀌는 시작 영역 offset top 값
     
      var init = function(){
        $header = app.mg.header;
        device = app.mg.device;
        browserDetect = navigator.userAgent.indexOf("Firefox");
       
        _setting();
        _scroll();
       
        $(window).resize(function(){
          _setting();                
        });
      };
     
      var _setting = function(){
        device = app.mg.device;
        headerH = $header.height();
        /* headerStart = $(".process_area").offset().top - 120;
        headerChangeColor = $(".p6_area").offset().top; */
        headerStart = 0;
        //headerChangeColor = $(".p6_area").offset().top;
      };
     
      var _scroll = function(){
        var tY, prevTY, sTop, prevSTop, browserDelta;

        $(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
          sTop = $(window).scrollTop();
          // mousewheel로 gnb 접고 펼침
          if(headerStart <= sTop){
            // header 접고 펼침
            if(device === "desktop"){                      // desktop 일 때
              if(headerFold === true){  
                _headerShow();
              }
            }else{                                        // tablet, mobile 일 때
              _headerFix();
            }
           
          }else{
            if(device === "desktop"){
              _headerHide();
            }else{
              _headerMHide();
            }
          }
         
          prevSTop = sTop;
        });
      };
     
      // desktop - header 펼침
      var _headerShow = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", y:-(headerH)});
        TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
        headerFold = false;
      };
     
      // desktop - header 접음
      var _headerHide = function(){
        TweenMax.killTweensOf($header);
        TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
          TweenMax.set($header, {display:"none"});
        }});
        headerFold = true;
      };
     
      // tablet, mobile - header 노출 및 고정
      var _headerFix = function(){
        TweenMax.killTweensOf($header);
        TweenMax.set($header, {display:"block", position:"fixed", y:0});
        headerFold = false;
      };
     
      // tablet, mobile - header 숨김
      var _headerMHide = function(){
        TweenMax.killTweensOf($header);
        //TweenMax.set($header, {display:"none", position:"absolute"});
        TweenMax.set($header, {display:"none"});
        headerFold = true;
      };
     
      return {
        init:init
      }
    })();
    
		// pc에서만 슬라이드
    var pcSlide = (function(){
      var $slide;
      var device, prevDevice;
     
      var init = function(){
        $slide= $(".sec_slide .slider"),
        //device = app.mg.device;
        $slide.on("afterChange", function(event, slick, currentSlide){
          $('.circle_flag p').removeClass('on');
          $('.circle_flag p[data-slide='+ currentSlide + ']').addClass('on');
        });
        _act();
        $(window).resize(function(){
          _act();
        });
      };
     
      var _act = function(){
        device = app.mg.device;
        if(device != prevDevice) {
          if(device === "desktop"){
            $slide.not(".slick-initialized").slick({
              infinite: false,
              slidesToShow: 1,
              slidesToScroll: 1,
            });
          }else{
            if($slide.hasClass("slick-initialized")){
              $slide.slick("unslick");
            }
          }
        }    
       
        prevDevice = device;
      };
      /* $slide.on('afterChange', function(event, slick, currentSlide, nextSlide){
        
        var slideIndex = currentSlide.attr('data-slick-index');
        console.log(slideIndex);
      }); */
      return {
        init:init
      }
    })();
   
    //--------------------------------- untact 실행 코드----------------------------------------------------//
    var init = function(){
      var browser = app.mg.browser;
      //if(browser === "IE") $("#wrap").find('.graph_wrap').addClass("ie");
      gnbControl.init();
      pcSlide.init();
    };
   
    return {
      init:init,
      responsive:responsive
    }
   
    //--------------------------------- jobflex-untact 실행 코드----------------------------------------------------//
  })();
  
  // jobflex 기업채널
	app.namespace('jobflexChannel');
	app.jobflexChannel = (function(){
		// gnb
		var gnbControl = (function(){
			var $header;
			var device,
					browserDetect,
					headerH,
					headerFold = true,
					headerStart = 0,            // header 노출 시작 영역 offsettop 값
					headerChangeColor = 0;      // header 색상 바뀌는 시작 영역 offset top 값
		
			var init = function(){
				$header = app.mg.header;
				device = app.mg.device;
				browserDetect = navigator.userAgent.indexOf("Firefox");
			
				_setting();
				_scroll();
			
				$(window).resize(function(){
					_setting();                
				});
			};
		
			var _setting = function(){
				device = app.mg.device;
				headerH = $header.height();
				headerStart = $(".sec_card_list").offset().top;
				//headerChangeColor = $(".p6_area").offset().top;
				//headerStart = 0;
			};
		
			var _scroll = function(){
				var tY, prevTY, sTop, prevSTop, browserDelta;

				$(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
					sTop = $(window).scrollTop();
					// mousewheel로 gnb 접고 펼침
					if(headerStart <= sTop){
						// header 접고 펼침
						if(device === "desktop"){                      // desktop 일 때
							if(headerFold === true){  
								_headerShow();
							}
						}else{                                        // tablet, mobile 일 때
							_headerFix();
						}
					
					}else{
						if(device === "desktop"){
							_headerHide();
						}else{
							_headerMHide();
						}
					}
				
					prevSTop = sTop;
				});
			};
		
			// desktop - header 펼침
			var _headerShow = function(){
				TweenMax.killTweensOf($header);
				TweenMax.set($header, {display:"block", y:-(headerH)});
				TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
				headerFold = false;
			};
		
			// desktop - header 접음
			var _headerHide = function(){
				TweenMax.killTweensOf($header);
				TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
					TweenMax.set($header, {display:"none"});
				}});
				headerFold = true;
			};
		
			// tablet, mobile - header 노출 및 고정
			var _headerFix = function(){
				TweenMax.killTweensOf($header);
				TweenMax.set($header, {display:"block", position:"fixed", y:0});
				headerFold = false;
			};
		
			// tablet, mobile - header 숨김
			var _headerMHide = function(){
				TweenMax.killTweensOf($header);
				TweenMax.set($header, {display:"none"});
				headerFold = true;
			};
		
			return {
				init:init
			}
		})();
				
		//channel intro 모션
		var chIntroM = {
			//$secWrap: null,
			$secEle : null,
			$secWrap : null,
			$titList : null,
			$imgList : null,
			secEleLength: 0,
			range: [],
			point: [],
			mobileMotion: true,
			scrollBox: null,
			init:function(){
				var _ = this;
				_.$scrollWrap = $('.sec_motion_list');
				_.point[0] = 0;
				_.point[1] = 10;
				_.point[2] = 45;
				_.point[3] = 65;
				_.point[4] = 100;
				_.range[0] = _.point[1] - _.point[0];
				_.range[1] = _.point[2] - _.point[1];
				_.range[2] = _.point[3] - _.point[2];
				_.range[3] = _.point[4] - _.point[3];
			},
			act: function(dir, r){
				var _ = this,
						rate = r * 100,
						imgMH01 = 52,
            imgMH02 = 42,
            //positionX = window.innerWidth * -1;
            positionX = -50;
				var tmpR01 = 100 * ((imgMH01 / _.range[1]) * ((_.point[1] - rate)/_.range[1] )),
						tmpR02 = 100 * ((imgMH02 / _.range[3]) * ((_.point[3] - rate)/_.range[3] ));
			
				if(tmpR01 < -(imgMH01)){
					tmpR01 = -(imgMH01)
				}else if(tmpR01 > 0){
					tmpR01 =0;
				}
				if(tmpR02 <  -(imgMH02)){
					tmpR02 =  -(imgMH02);
				}else if(tmpR02 > 0){
					tmpR02 =0;
				}
				if(rate <= _.point[0]){
					TweenMax.to(_.$scrollWrap.find('li:first-child .scroll_img'), 0.4, {y:0, ease:"Quad.easeOut"});
				}else if(_.point[1] < rate && rate <= _.point[2] ){
					TweenMax.to(_.$scrollWrap.find('li:first-child .scroll_img'), 0.4, {y:tmpR01 + "%", ease:"Quad.easeOut"});
					//TweenMax.to(_.$scrollWrap, 0.4, {x:0, ease:"Quad.easeOut"});
				}else if(_.point[2] < rate && rate <= _.point[3] ){
					//TweenMax.to(_.$scrollWrap, 0.4, {x:positionX + "%", ease:"Quad.easeOut"});
					TweenMax.to(_.$scrollWrap.find('li:last-child .scroll_img'), 0.4, {y:0, ease:"Quad.easeOut"});
				}else{
					TweenMax.to(_.$scrollWrap.find('li:last-child .scroll_img'), 0.4, {y:tmpR02 + "%", ease:"Quad.easeOut"});
				}
        if( rate <= _.point[2]){
          TweenMax.to(_.$scrollWrap, 0.4, {x:0 + "%", ease:"Quad.easeOut"});
        }else{
          TweenMax.to(_.$scrollWrap, 0.4, {x:positionX + "%", ease:"Quad.easeOut"});
        }
      },
      actIE: function(dir,r){
        var _ = this,
            positionX = window.innerWidth * -1,
            imgMH01 = -52,
            imgMH02 = -42;
        var secIntIe = new TimelineLite();
        secIntIe.to(_.$scrollWrap.find('li:first-child .scroll_img'), 0.8,{y:imgMH01 + "%"})
                .call(function(){_.$scrollWrap.addClass("active")}, null, null, 1)
                .to(_.$scrollWrap.find('li:last-child .scroll_img'), 0.6,{y:imgMH02 + "%", delay:1.3})
        
      },
			mobileAct: function(){
        var _ = this;
        
        _.$scrollWrap.css('transform','none');
        _.$scrollWrap.find('li').css('transform','none')
			}
		}
		//channel biz section
		var chBizSec = {
			$secWrap : null,
			$secLeft : null,
			$secRight : null,

			init:function(){
				var _ = this;
				_.$secWrap = $('.sec_biz_cont');
				_.$secLeft = _.$secWrap.find('.s_to_b.bx_scroll');
				_.$secRight = _.$secWrap.find('.b_to_t.bx_scroll');
			},
			act:function(dir, r){
				var _ = this,
						rate = r,
						scrollMoveH = -71,
						moveP;
				//var scrollMoveH02 = 78;
				moveP = rate * scrollMoveH;
        if(rate >= 0.85){
          console.log('222');
          TweenMax.to( _.$secLeft.find('.scroll_img'), 0.4, {top: scrollMoveH + '%', ease:"Quad.easeOut"})
				  TweenMax.to( _.$secRight.find('.scroll_img'), 0.4, {bottom: scrollMoveH + '%', ease:"Quad.easeOut"});
        }else{
          TweenMax.to( _.$secLeft.find('.scroll_img'), 0.4, {top: moveP + '%', ease:"Quad.easeOut"})
          TweenMax.to( _.$secRight.find('.scroll_img'), 0.4, {bottom: moveP + '%', ease:"Quad.easeOut"});
        }
        
      },
      actIE:function(dir,r){
        var _ = this;
        var secBizIe = new TimelineLite();
        secBizIe.to(_.$secLeft.find('.scroll_img'), 1,{top:'-71%',bottom:0})
                .to(_.$secRight.find('.scroll_img'), 0.8,{bottom:'-71%', delay:0.3})
      }
    }
    //channel post section
    var chPostSec ={
      $secWrap : null,
			$secScroll : null,

			init:function(){
				var _ = this;
				_.$secWrap = $('.sec_post_cont');
				_.$secScroll = _.$secWrap.find('.bx_scroll');
			},
			act:function(dir, r){
				var _ = this,
						rate = r,
						scrollMoveH = -175,
						moveP;
				moveP = rate * scrollMoveH;
        if(rate >= 0.85){
          TweenMax.to( _.$secScroll.find('.scroll_img'), 0.4, {top: scrollMoveH + '%', ease:"Quad.easeOut"})
        }else{
				  TweenMax.to( _.$secScroll.find('.scroll_img'), 0.4, {top: moveP + '%', ease:"Quad.easeOut"})
        }
      },
      actIE:function(dir,r){
        var _ = this;
        TweenMax.to( _.$secScroll.find('.scroll_img'), 1.5, {top:'-175%', ease:"Quad.easeOut"})
      }
    }
		//--------------------------------- channel 실행 코드----------------------------------------------------//
		var init = function(){
			var browser = app.mg.browser,
					device = app.mg.device;
      var $header = app.mg.header;
			if(device === "desktop" && browser === "IE"){
        $('body').addClass('ie_scroll');
      }
			$(window).resize(function(){
				//prevDevice = device;
				device = app.mg.device;
				browser = app.mg.browser;
				if(device === "desktop" && browser === "IE"){
          $('body').addClass('ie_scroll');
        }else{
          $('body').removeClass('ie_scroll');
        }
			});
			
			chIntroM.init();
			//chIntroM.setting();
      chBizSec.init();
      chPostSec.init();
			scrollDetect.init([{
				ele:$(".sec_channel_intro"),
				type: "sticky",
				duration:0,
				callback:function(dir, r){
					device = app.mg.device;
					if(device === "desktop" && browser != "IE"){
						if($header.css("display") === "block"){
							TweenMax.set($header, {display:"none"});
						}
						chIntroM.act(dir, r);
					}else if(device === "desktop" && browser === "IE"){
            chIntroM.actIE(dir,r);
					}else{
						chIntroM.mobileAct();
					}
				}
			},{
				ele:$(".sec_biz_cont"),
				type: "sticky",
				duration:0,
				callback:function(dir, r){
					device = app.mg.device;
					if(device === "desktop" && browser != "IE"){
						chBizSec.act(dir, r);
					}else if(device === "desktop" && browser === "IE"){
            chBizSec.actIE(dir,r);
					}else{
						//chBizSec.mobileAct();
					}
				}
			},{
				ele:$(".sec_post_cont"),
				type: "sticky",
				duration:0,
				callback:function(dir, r){
					device = app.mg.device;
					if(device === "desktop" && browser != "IE"){
						chPostSec.act(dir, r);
					}else if(device === "desktop" && browser === "IE"){
            chPostSec.actIE(dir,r);
					}else{
						//chIntroM.mobileAct();
					}
				}
			}]);
			//if(browser === "IE") $("#wrap").find('.graph_wrap').addClass("ie");
			gnbControl.init();
		};
	
		return {
			init:init,
			//responsive:responsive
		}
	})();
  
  	// jobflex 기업채널 ver2
    app.namespace('jobflexChannelV2');
    app.jobflexChannelV2 = (function(){
      //channel intro 모션
      var chIntroM = {
        $scrollWrap : null,
        motionFlag : false,
        init:function(){
          var _ = this;
          _.$scrollWrap = $('.sec_intro_wrap').find('.v_motion').find('.sec_motion_list');
        },
        act: function(){
          var _ = this,
              movValue = '-50';

          if(_.motionFlag == false){
            _.$scrollWrap.find('li:first-child .bx_scroll').animate({scrollTop: '200'},1000,function(){_.$scrollWrap.find('li:first-child .bx_scroll').clearQueue()});
            var act02 = setInterval(function(){
              TweenMax.to(_.$scrollWrap, 0.8, {x:movValue+'%', ease:"Quad.easeOut"});
              $('.tab_tit button.brand').removeClass('active');
              $('.tab_tit button.post').addClass('active');
              clearInterval(act02);
            }, 1000);
            var act03 = setInterval(function() {
              _.$scrollWrap.find('li:last-child .bx_scroll').animate({scrollTop: '200'},1000,function(){_.$scrollWrap.find('li:last-child .bx_scroll').clearQueue();});
              _.motionFlag = true;
              clearInterval(act03);
            }, 2400);
          }
        },
        mobileAct: function(){
          var _ = this;
          _.$scrollWrap.css('transform','none');
          _.$scrollWrap.find('li').css('transform','none')
        }
      }
      //channel biz section
      var chBizSec = {
        $secWrap : null,
        $secLeft : null,
        $secRight : null,

        init:function(){
          var _ = this;
          _.$secWrap = $('.sec_biz_cont');
          _.$secLeft = _.$secWrap.find('.s_to_b.bx_scroll');
          _.$secRight = _.$secWrap.find('.b_to_t.bx_scroll');
        },
        act:function(dir, r){
          var _ = this,
              rate = r,
              scrollMoveH = -71,
              moveP;
          //var scrollMoveH02 = 78;
          moveP = rate * scrollMoveH;
          if(rate >= 0.85){
            //console.log('222');
            TweenMax.to( _.$secLeft.find('.scroll_img'), 0.4, {top: scrollMoveH + '%', ease:"Quad.easeOut"})
            TweenMax.to( _.$secRight.find('.scroll_img'), 0.4, {bottom: scrollMoveH + '%', ease:"Quad.easeOut"});
          }else{
            TweenMax.to( _.$secLeft.find('.scroll_img'), 0.4, {top: moveP + '%', ease:"Quad.easeOut"})
            TweenMax.to( _.$secRight.find('.scroll_img'), 0.4, {bottom: moveP + '%', ease:"Quad.easeOut"});
          }

        },
        actIE:function(dir,r){
          var _ = this;
          var secBizIe = new TimelineLite();
          secBizIe.to(_.$secLeft.find('.scroll_img'), 1,{top:'-71%',bottom:0})
                  .to(_.$secRight.find('.scroll_img'), 0.8,{bottom:'-71%', delay:0.3})
        }
      }
      //channel post section
      var chPostSec ={
        $secWrap : null,
        $secScroll : null,

        init:function(){
          var _ = this;
          _.$secWrap = $('.sec_post_cont');
          _.$secScroll = _.$secWrap.find('.bx_scroll');
        },
        act:function(dir, r){
          var _ = this,
              rate = r,
              scrollMoveH = -175,
              moveP;
          moveP = rate * scrollMoveH;
          if(rate >= 0.85){
            TweenMax.to( _.$secScroll.find('.scroll_img'), 0.1, {top: scrollMoveH + '%', ease:"Quad.easeOut"})
          }else{
            TweenMax.to( _.$secScroll.find('.scroll_img'), 0.1, {top: moveP + '%', ease:"Quad.easeOut"})
          }
        },
        actIE:function(dir,r){
          var _ = this;
          TweenMax.to( _.$secScroll.find('.scroll_img'), 1.5, {top:'-175%', ease:"Quad.easeOut"})
        }
      }
      var chEffect = {
        motionFlag : false,
        cntFlag: false,
        $graphWrap : null,
        $beforeBox : null,
        $afterBox : null,

        init:function(){
          var _ = this;
          _.$graphWrap = $('.bx_graph_wrap')
          _.$beforeBox = $('.g_box.before');
          _.$afterBox = $('.g_box.after');
        },
        act:function(){
          var _ = this,
              boxHB = 240,
              boxHA = 380;
          var tl1 = new TimelineLite,
              tl2 = new TimelineLite,
              imgLine1 = new TimelineLite,
              imgLine2 = new TimelineLite;


          if(!_.motionFlag){
            tl1.to(_.$beforeBox, 0, {opacity:1})
               .to(_.$beforeBox, 0.4, {height:boxHB})
               .to(_.$beforeBox.find('.g_box_inner'), 0.2,{opacity:1});
            tl2.to(_.$afterBox, 0, {opacity:1})
               .to(_.$afterBox, 0.4, {height:boxHA})
               .to(_.$afterBox.find('.g_box_inner'), 0.2,{opacity:1})
          }
          /* var act03 = setInterval(function() {
            _.$scrollWrap.find('li:last-child .bx_scroll').animate({scrollTop: '200'},1000,function(){_.$scrollWrap.find('li:last-child .bx_scroll').clearQueue();});
            _.motionFlag = true;
            clearInterval(act03);
          }, 2000); */

          var actCnt = setInterval(function(){
            if(!_.cntFlag){
              $('.count').each(function () {
                $(this).css('opacity','1')
                var showCnt;
                $(this).prop('Counter',0).animate({
                  Counter: $(this).text().toString().replace(/[^\d]+/g, "")
                }, {
                  duration: 1500,
                  easing: 'swing',
                  step: function (now) {
                      showCnt = Math.ceil(now);
                      showCnt = showCnt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      $(this).text(showCnt);
                  }
                });
              });
              imgLine1.to(_.$beforeBox.find('.img1'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img2'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img3'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img4'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img5'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img6'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img7'),0.2,{opacity:1})
                      .to(_.$beforeBox.find('.img8'),0.2,{opacity:1});
              imgLine2.to(_.$afterBox.find('.img1'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img2'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img3'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img4'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img5'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img6'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img7'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img8'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img9'),0.15,{opacity:1})
                      .to(_.$afterBox.find('.img10'),0.15,{opacity:1})
                      .to(_.$graphWrap.find('.arrow'),0.6,{css:{scale:1, opacity:1},ease:Quad.easeInOut})
              _.cntFlag = true;
              _.motionFlag = true;
              clearInterval(actCnt);
            }
          }, 600);
        }

      }
      //--------------------------------- channel 실행 코드----------------------------------------------------//
      var init = function(){
        var browser = app.mg.browser,
            device = app.mg.device;
        var $header = app.mg.header;
        if(device === "desktop" && browser === "IE"){
          $('body').addClass('ie_scroll');
          IESetting();
        }
        $(window).resize(function(){
          //prevDevice = device;
          device = app.mg.device;
          browser = app.mg.browser;
          if(device === "desktop" && browser === "IE"){
            $('body').addClass('ie_scroll');
          }else{
            $('body').removeClass('ie_scroll');
          }
        });

        chIntroM.init();
        //chIntroM.setting();
        chBizSec.init();
        chPostSec.init();
        chEffect.init();
        scrollDetect.init([{
          ele:$(".sec_intro_wrap"),
          type: "common",
          duration:0,
          callback:function(dir, r){
            device = app.mg.device;
            if(device === "desktop" && browser != "IE"){
              chIntroM.act(dir, r);
            }else if(device === "desktop" && browser === "IE"){
              //chIntroM.act(dir,r);
            }else{
              chIntroM.mobileAct();
            }
          }
        },{
          ele:$(".v_motion .sec_biz_cont"),
          type: "common",
          duration:0,
          callback:function(dir, r){
            device = app.mg.device;
            if(device === "desktop" && browser != "IE"){
              chBizSec.act(dir, r);
            }else if(device === "desktop" && browser === "IE"){
              chBizSec.actIE(dir,r);
            }else{
              //chBizSec.mobileAct();
            }
          }
        },{
          ele:$(".sec_post_cont"),
          type: "sticky",
          duration:'winH * 0.8',
          callback:function(dir, r){
            device = app.mg.device;
            if(device === "desktop" && browser != "IE"){
              chPostSec.act(dir, r);
            }else if(device === "desktop" && browser === "IE"){
              chPostSec.actIE(dir,r);
            }else{
              //chIntroM.mobileAct();
            }
          }
        },{
          ele: $('.sec_add_effect'),
          type:'common',
          duration:'winH * 0.5',
          callback:function(){
            device = app.mg.device;
            if(device === 'desktop'){
              chEffect.act();
            }
          }
        }]);
        function IESetting(){
          $('.sec_biz_channel.v_motion').find('.scroll_img').removeClass('shadow').parent('.bx_scroll').addClass('shadow');
        }
        $('.tab_tit button').click(function(){
          if(chIntroM.motionFlag == true){
            $('.sec_motion_list').find('li .bx_scroll').scrollTop();
            $(this).addClass('active').siblings('button').removeClass('active');
            if($(this).hasClass('brand')){
              TweenMax.to($('.sec_motion_list'), 0.4, {x:'0%', ease:"Quad.easeOut"});
            }else{
              TweenMax.to($('.sec_motion_list'), 0.4, {x:'-50%', ease:"Quad.easeOut"});
            }
          }if(browser === "IE"){
            $('.sec_motion_list').find('li .bx_scroll').scrollTop();
            $(this).addClass('active').siblings('button').removeClass('active');
            if($(this).hasClass('brand')){
              TweenMax.to($('.sec_motion_list'), 0.2, {x:'0%', ease:"Quad.easeOut"});
            }else{
              TweenMax.to($('.sec_motion_list'), 0.2, {x:'-50%', ease:"Quad.easeOut"});
            }
          }
        })
      };

      return {
        init:init,
        //responsive:responsive
      }
    })();

    // jobflex ai역량- G/S ver2
    app.namespace("jobflexAbilityV2");
    app.jobflexAbilityV2 = (function(){    
      // 반응형 분기 처리
      var responsive = (function(){
        var $p6Video, $logoArea;
        var device, prevDevice, browser;

        var src = {
          dashboardImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/dashboard_img.jpg",
          introLightVideo: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/video/light3.mp4",
          darkImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/process_large_dark.jpg",
          darkMImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/process_large_dark.jpg",
          p6Video: "https://fs.hubspotusercontent00.net/hubfs/4570750/inAIR/video/renewal/p6_renewal.mp4",
          p6MVideo: "https://fs.hubspotusercontent00.net/hubfs/4570750/inAIR/video/renewal/p6_renewal_m.mp4",
          logoImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/web/sub/01_intro/intro/ai/story_logo.jpg",
          logoMImg: "https://cdn2.hubspot.net/hubfs/4570750/inAIR/img/mobile/sub/01_intro/ai/story_logo.jpg"
        };

        var init = function(){
          device = app.mg.device;
          browser = app.mg.browser;
          $p6Video = $(".p6_area video");
          $logoArea = $(".customer_area .logo_area");

          _setting();

          $(window).resize(function(){
            prevDevice = device;
            device = app.mg.device;
            browser = app.mg.browser;

            if(device !== prevDevice) _setting();
          });

          prevDevice = device;
        };

        var _setting = function(){
          if(device === "desktop"){
            _desktop();
          }else{
            _mobile();
          }
        };

        var _desktop = function(){
          $p6Video.attr("src", src.p6Video);
          $logoArea.html("<img src='"+src.logoImg+"' alt=''>");
        };

        var _mobile = function(){
          if(device === "tablet"){
            $p6Video.attr("src", src.p6Video);
          }else{
            $p6Video.attr("src", src.p6MVideo);
          }
          $logoArea.html("<img src='"+src.logoMImg+"' alt=''>");
        };

        return{
          init:init
        }
      })();

      // gnb
      var gnbControl = (function(){
        var $header;
        var device,
            browserDetect,
            headerH,
            headerFold = false,
            headerStart = 0,            // header 노출 시작 영역 offsettop 값
            headerChangeColor = 0;      // header 색상 바뀌는 시작 영역 offset top 값

        var init = function(){
          $header = app.mg.header;
          device = app.mg.device;
          browserDetect = navigator.userAgent.indexOf("Firefox");

          _setting();
          _scroll();

          $(window).resize(function(){
            _setting();                
          });
        };

        var _setting = function(){
          device = app.mg.device;
          headerH = $header.height();
          headerStart = $(".process_area").offset().top - 120;
          headerChangeColor = $(".p6_area").offset().top;
        };

        var _scroll = function(){
          var tY, prevTY, sTop, prevSTop, browserDelta;

          $(window).on("scroll wheel mousewheel DOMMouseScroll touchmove", function(e){       // 모바일은 touchmove
            sTop = $(window).scrollTop();

            // mousewheel로 gnb 접고 펼침
            if(headerStart <= sTop){
              // header 접고 펼침
              if(device === "desktop"){                      // desktop 일 때
                if(headerFold === true){  
                  _headerShow();
                }
              }else{                                        // tablet, mobile 일 때
                _headerFix();
              }

            }else{
              if(device === "desktop"){
                _headerHide();
              }else{
                _headerMHide();
              }
            }

            prevSTop = sTop;
          });
        };

//         // desktop - header 펼침
//         var _headerShow = function(){
//           TweenMax.killTweensOf($header);
//           TweenMax.set($header, {display:"block", y:-(headerH)});
//           TweenMax.to($header, 0.3, {y:0, ease:"Quad.easeOut"});
//           headerFold = false;
//         };

//         // desktop - header 접음
//         var _headerHide = function(){
//           TweenMax.killTweensOf($header);
//           TweenMax.to($header, 0.2, {y:-(headerH), ease:"Quad.easeOut", onComplete:function(){
//             TweenMax.set($header, {display:"none"});
//           }});
//           headerFold = true;
//         };

        // tablet, mobile - header 노출 및 고정
        var _headerFix = function(){
          TweenMax.killTweensOf($header);
          TweenMax.set($header, {display:"block", position:"fixed", y:0});
          headerFold = false;
        };

        // tablet, mobile - header 숨김
        var _headerMHide = function(){
          TweenMax.killTweensOf($header);
          //TweenMax.set($header, {display:"none", position:"absolute"});
          TweenMax.set($header, {display:"none"});
          headerFold = true;
        };

        return {
          init:init
        }
      })();


      // 뉴스 반응형일 때 슬라이드로 변환
      var newsMobileSlide = (function(){
        var $newsUl;
        var device, prevDevice;

        var init = function(){
          $newsUl = $(".news_area ul.slides");
          //device = app.mg.device;

          _act();
          $(window).resize(function(){
            _act();
          });
        };

        var _act = function(){
          device = app.mg.device;
          if(device != prevDevice) {
            if(device === "mobile"){
              $newsUl.not(".slick-initialized").slick({
                fade:true,
                slidesToShow:1,
                slidesToScroll:1,
                arrows:false,
                dots:true,
                infinite: false,
                autoplay:true,
                autoplaySpeed:3500,
                draggable:false,
                speed:300,

              });
            }else{
              if($newsUl.hasClass("slick-initialized")){
                $newsUl.slick("unslick");
              }
            }
          }    

          prevDevice = device;
        };

        return {
          init:init
        }
      })();

     /*
          AI-사람 대화 UI
          array = [{st: start time, rapid: motion rapid (한번 튕길 때 속도), repeat: repeat num (반복수는 문장의 단어 수만큼)}]
       */
      var aiHumanCom = (function(){
          var $comCon, $txtHuman, $txtAi, $aiShape, $circle, $mask;
          var hmArr = [],                         // 사람 멘트 array
              amArr = [],                         // ai 멘트 array
              asArr = [],                         // ai shape 정보 array
              curIdx = 0,                         // 현재 ai-사람 멘트 index
              aihumanDelay = 0.7,                 // ai랑 사람 멘트 사이 딜레이
              nextDelay = 1.4,                    // 다음 멘트세트 시작 딜레이
              device,
              t;


          var init = function(h, a, as){           // 사람멘트, ai멘트, ai shape 모션 정보
            $comCon = $(".com_con");
            $txtHuman = $comCon.find(".txt.human");
            $txtAi = $comCon.find(".txt.ai");
            $aiShape = $comCon.find(".ai_shape");
            $circle = $comCon.find(".circle");
            $mask = $comCon.find(".mask");
            device = app.mg.device;

            hmArr = h;
            amArr = a;
            asArr = as;

            _controlMotion();

            $(window).resize(function(){
              device = app.mg.device;
            });
          };

          // 전체 모션 컨트롤
          var _controlMotion = function(){
              if(curIdx >= hmArr.length){
                  curIdx = 0;
              }

              _aiTyping(amArr[curIdx]);
              //_humanCom(hmArr[curIdx]);
              _pulseMotion(asArr[curIdx]);
          };

          // ai 타이핑 모션
          var _aiTyping = function(txt){
            var w = 0;

            TweenMax.set($txtAi, {display:"block"});
            TweenMax.to($txtAi, 0.5, {autoAlpha:1, ease:"Cubic.easeOut"});

            if(device === "mobile"){
              TweenMax.set($mask, {display:"block", autoAlpha:0});
              TweenMax.to($mask, 0.4, {autoAlpha:0.7, ease:"Quad.easeOut"});
              TweenMax.to($aiShape, 0.3, {autoAlpha:1, ease:"Cubic.easeOut"});
            }else{
              TweenMax.set($mask, {display:"none"});
              TweenMax.set($aiShape, {display:"block", autoAlpha:1});
            }

            KM({
                eleId: "txt_ai",
                letter: new Array(txt),
                letterTime: 0.03,
                letterDelay: 0.06,
                cursorEnd: false,
                callback: function(i, length){
                  if($txtAi.find(".letter").eq(i).width() === 0){
                    w += $txtAi.find(".letter").eq(0).width() * 0.5;
                  }else{
                    w += $txtAi.find(".letter").eq(i).width();
                  }
                  //w += $txtAi.find(".letter").eq(i).width() + 2;
                  TweenMax.to($txtAi.find(".typing_area"), 0.03, {width:w, ease:"Quad.easeInOut"});
                  TweenMax.to($txtAi, 0.03, {x:-w*0.5, ease:"Quad.easeInOut"});

                  if(i === length-2){
                    if(device === "mobile"){
                      TweenMax.to($aiShape, 0.4, {autoAlpha:0, ease:"Expo.easeOut", delay:aihumanDelay});
                      TweenMax.to($mask, 0.4, {autoAlpha:0, ease:"Expo.easeOut", delay:aihumanDelay, onComplete:function(){
                        TweenMax.set($mask, {display:"none"});
                      }});
                    }
                    TweenMax.to($txtAi, 0.3, {autoAlpha:0, ease:"Quad.easeOut", delay:aihumanDelay, onComplete:function(){
                      TweenMax.set($txtAi, {clearProps:"all"});
                      _humanCom(hmArr[curIdx]);
                    }});
                  }
                }
            });
          };

          // 사람 말풍선 모션
          var _humanCom = function(txt){
            var x;

            $txtHuman.text(txt);          
            $aiShape.removeClass("on");

            if(device === "desktop"){
              x = -(350+$txtHuman.width()*0.5);
            }else{
              x = -$txtHuman.width()*0.5;
            }

            TweenMax.set($txtHuman, {display:"block", height:0, scale:0.7, x:x});            // 중앙선과 사람 가운데까지 거리 : 350px
            TweenMax.to($txtHuman, 0.5, {autoAlpha:1, scale:1, height:43, ease:"Power3.easeInOut"});
            TweenMax.to($txtHuman, 0.5, {autoAlpha:0, ease:"Power3.easeInOut", delay:nextDelay, onComplete:function(){
                TweenMax.set($txtHuman, {display:"none"});
                curIdx++;
                _controlMotion();
            }});
          };

          // ai shape 모션
          var _pulseMotion = function(v){
              var firstRate = 1.02,
                  repeatRate = 1.01;
              var t = new TimelineMax({repeat:v.repeat, repeatDelay:v.repeatDelay});

            $aiShape.addClass("on");
              t.kill();
              t.to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:firstRate, ease:"Quad.easeIn"})
              .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:1.03, ease:"Quad.easeInOut"})
              .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:repeatRate, ease:"Quad.easeIn"})
              .to($circle, v.rapid, {x:"-50.1%", y:"-50.1%", scale:1, ease:"Quad.easeInOut"});
          };

          return{
              init:init
          }
      })();

      // V4 영상 음소거 on/off
      var v4VideoMute = function(){
        var $techArea = $(".tech_area"),
            $btnMute = $techArea.find("button");
        var vInfo = [];

        for(var i=0; i<$btnMute.length; i++){
          vInfo[i] = {
            btn: $btnMute.eq(i),
            video: document.getElementById($btnMute.eq(i).data("target")),
              onoff: "off"
            };
          }

          $btnMute.click(function(e){
          e.preventDefault();

            var idx = $(this).data("index");
            if(vInfo[idx].onoff === "off"){ // 소리가 꺼져있을 때
              for(var j=0; j<vInfo.length; j++){ // 다른 영상 소리 켜져있으면 끄도록
                if(!vInfo[j].video.muted) off(j);
              }
              on(idx);
            }else{
              off(idx);
            }
          });

        function on(i){
          if(vInfo[i].video.muted) vInfo[i].video.muted = false;
          vInfo[i].btn.attr("class", "on").find(".hidden").text("ON");
          vInfo[i].onoff = "on";
        }

        function off(i){
          if(!vInfo[i].video.muted) vInfo[i].video.muted = true;
          vInfo[i].btn.attr("class", "off").find(".hidden").text("OFF");
          vInfo[i].onoff = "off";
        }
      };

      // graph 모션
      var graphDraw = (function(){
        var $graphWrap, $graph, $target;
        var targetArr = [],
            num = 0,
            motionReady = true,
            prevDevice,
            browser;

        var init = function(){
          $graphWrap = $(".graph_wrap");
          $graph = $("#graph_path");
          $target = $graph.find("polyline");
          browser = app.mg.browser;

          _act();
        };

        var _act = function(){
          if(motionReady === false || app.mg.device != "desktop" || browser === "IE") return;

          var $mark = $graphWrap.find(".mark");
          var partCnt = 4,
              motionTime = 1.2;
              leng = $target[0].getTotalLength();

          $target.css({"stroke-dasharray":leng + "," + leng, "stroke-dashoffset":leng});
          var t = TweenMax.to($target, motionTime, {strokeDashoffset:0, ease:"Quad.easeOut"});

          TweenMax.set($mark, {display:"block", y:-10});
          TweenMax.set($mark.eq(3), {scale:0.8});

          TweenMax.to($mark.eq(0), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.2});
          TweenMax.to($mark.eq(1), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.4});
          TweenMax.to($mark.eq(2), 0.2, {autoAlpha:1, y:0, ease:"Quad.easeOut", delay:0.6});
          TweenMax.to($mark.eq(3), 0.4, {autoAlpha:1, y:0, rotationY:360, ease:"Cubic.easeOut", delay:1.0});

          motionReady = false;
        };

        return {
          init:init
        }
      })();

      // pc에서만 슬라이드
      var pcSlide = (function(){
        var $gTechSlide, $reportSlide;
        var device, prevDevice;

        var init = function(){
          $gTechSlide= $(".slider.g_tech"),
          $reportSlide = $(".slider.report_cont");
          //device = app.mg.device;

          _act();
          $(window).resize(function(){
            _act();
          });
        };

        var _act = function(){
          device = app.mg.device;
          if(device != prevDevice) {
            if(device === "desktop"){
              $gTechSlide.not(".slick-initialized").slick({
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
              });
              $reportSlide.not(".slick-initialized").slick({
                infinite: false,
                slidesToShow: 1,
                variableWidth: true,
                slidesToScroll: 1,
                dots:true,
              });
            }else{
              if($gTechSlide.hasClass("slick-initialized")){
                $gTechSlide.slick("unslick");
              }
              if($reportSlide.hasClass("slick-initialized")){
                $reportSlide.slick("unslick");
              }
            }
          }    

          prevDevice = device;
        };

        return {
          init:init
        }
      })();

      // line 모션
      var lineDraw = (function(){
        var $lineWrap, $line = [], $target;
        var targetArr = [],
            num = 0,
            motionReady = true,
            prevDevice,
            leng = [],
            browser;

        var init = function(){
          $lineWrap = $(".bx_svg_line svg");
          $line[1] = $('#l_1');
          $line[2] = $('#l_2');
          $line[3] = $('#l_3');
          $line[4] = $('#l_4');
          browser = app.mg.browser;
          if(motionReady === false || app.mg.device != "desktop" || browser === "IE") return;
          leng[1] = document.getElementById('l_1').getTotalLength();
          leng[2] = document.getElementById('l_2').getTotalLength();
          leng[3] = document.getElementById('l_3').getTotalLength();
          leng[4] = document.getElementById('l_4').getTotalLength();
          $line[1].css({"stroke-dasharray":leng[1], "stroke-dashoffset":leng[1]});
          $line[2].css({"stroke-dasharray":leng[2], "stroke-dashoffset":leng[2]});
          $line[3].css({"stroke-dasharray":leng[3], "stroke-dashoffset":leng[3]});
          $line[4].css({"stroke-dasharray":leng[4], "stroke-dashoffset":leng[4]});
        };
        var act = function(){
          if(motionReady === false || app.mg.device != "desktop" || browser === "IE") return;
          var partCnt = 4,
              motionTime = [],
              tl1 = new TimelineLite;

          motionTime[1] = 0.2;
          motionTime[2] = 0.3;


          tl1.to($line[1], motionTime[1], {opacity:1,strokeDashoffset:0, ease:"Linear.easeNone"})
             .to($line[2], motionTime[2], {opacity:1,strokeDashoffset:0, ease:"Linear.easeNone"})
             .to($line[3], motionTime[1], {opacity:1,strokeDashoffset:0, ease:"Linear.easeNone"})
             .to($line[4], motionTime[1], {opacity:1,strokeDashoffset:0, ease:"Linear.easeNone"});
          //$target.css({"stroke-dasharray":leng + "," + leng, "stroke-dashoffset":leng});
          motionReady = false;
        };

        return {
          init:init,
          act:act
        }
      })();

      //gs 섹션
      var boxMov01 = (function(){
        var $secWrap, $contG, $contS, $contN, $arrow;
        var browser,motionReady = true;

        var init = function(){
          $secWrap = $('.process_area');
          $contG = $secWrap.find('.box.cont_g');
          $contS = $secWrap.find('.box.cont_s');
          $contN = $secWrap.find('.box.cont_n');
          $arrow = $secWrap.find('.arrow');
          browser = app.mg.browser;
          if(motionReady === false || app.mg.device != "desktop") return;
          if(browser === 'IE'){
            $secWrap.addClass('ie_case');
          }
          $contG.css({'transform':'translate(-100%, 0)','opacity':0});
          $contS.css({'transform':'translate(-70%, 0)','opacity':0});
          $contN.css({'transform':'translate(-50%, 0)','opacity':0});
        };
        var act = function(){
          browser = app.mg.browser;
          if(motionReady === false || app.mg.device != "desktop") return;
          TweenMax.to($('.box.cont_g'), 0.7, {x:'0%',opacity:1, ease:"Quad.easeOut"});
          TweenMax.to($contS, 0.7, {x:'0%',opacity:1, delay:0.7, ease:"Quad.easeOut"});
          TweenMax.to($contN, 0.7, {x:'0%',opacity:1, delay:1.4, ease:"Quad.easeOut"});
          
          setTimeout(arrowAct, 2000)
          motionReady = false;
        }
        var arrowAct = function(){
          $arrow.find('circle').css('opacity','0')
          var arrowtl = new TimelineLite;
          arrowtl.to($('.cir1'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir1_1'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir2'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir3'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir4'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir5'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir6'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir7'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir8'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir9'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir10'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir11'),0.1,{opacity:1,ease:"Quad.easeOut"})
                 .to($('.cir12'),0.1,{opacity:1,ease:"Quad.easeOut"});
          setTimeout(arrowAct, 1600)
        }

        return {
          init:init,
          act:act,
          arrowAct:arrowAct
        }

      })();
      //심화 검사 섹션
      var boxMov02 = (function(){
        var $secWrap,$tInfo01,$tInfo02,$tInfo03,$tInfo04;
        var browser,motionReady = true;

        var init = function(){
          $secWrap = $('.s_tech_area');
          $tInfo01 = $secWrap.find('.tech_info1');
          $tInfo02 = $secWrap.find('.tech_info2');
          $tInfo03 = $secWrap.find('.tech_info3');
          $tInfo04 = $secWrap.find('.tech_info4');
          browser = app.mg.browser;
          if(motionReady === false || app.mg.device != "desktop") return;

          $tInfo01.css({'transform':'translate(400%, 0)','opacity':0});
          $tInfo02.css({'transform':'translate(300%, 0)','opacity':0});
          $tInfo03.css({'transform':'translate(200%, 0)','opacity':0});
          $tInfo04.css({'transform':'translate(200%, 0)','opacity':0})
        };
        var act = function(){
          browser = app.mg.browser;
          if(motionReady === false || app.mg.device != "desktop") return;
          var tl1 = new TimelineLite;
          tl1.to($tInfo01,0.7,{x:'0%',opacity:1,ease:"Quad.easeOut"})
             .to($tInfo02,0.7,{x:'0%',opacity:1,ease:"Quad.easeOut"})
             .to($tInfo03,0.7,{x:'0%',opacity:1,ease:"Quad.easeOut"})
             .to($tInfo04,0.7,{x:'0%',opacity:1,ease:"Quad.easeOut"})
          /* TweenMax.to($('.box.cont_g'), 1.2, {x:'0%',opacity:1, ease:"Quad.easeOut"});
          TweenMax.to($contS, 1.2, {x:'0%',opacity:1, delay:0.7, ease:"Quad.easeOut"});
          TweenMax.to($arrow, 1.2, {x:'0%',opacity:1, delay:1.5, ease:"Quad.easeOut",onComplete:function(){
            $arrow.addClass('on')
          }}); */
          motionReady = false;
        }

        return {
          init:init,
          act:act,
        }

      })();
      //--------------------------------- inairAI 실행 코드----------------------------------------------------//
      var init = function(){
        var browser = app.mg.browser;
        if(browser === "IE") $("#wrap").find('.graph_wrap').addClass("ie");

        // 로딩 화면
        TweenMax.to($(".full_loading"), 0.3, {autoAlpha:0, onComplete:function(){
          TweenMax.set($(".full_loading"), {display:"none"});
        }});

        gnbControl.init();

        newsMobileSlide.init();     // 뉴스 반응형 슬라이드 교체
        pcSlide.init();
        lineDraw.init();
        boxMov01.init();
        boxMov02.init();
        //boxMov01.arrowAct();
        // ai-사람 대화
        aiHumanCom.init(
            ["안녕하세요. 마케팅파트에 지원한 이지혜입니다", "지식도 중요하지만 무엇보다 실무 경험이라 생각합니다", "고객의 요구에 유연하게 대응해야 하기 때문입니다", "대학생 때 마케팅 관련 대외활동과 인턴 경험이 있습니다", "우수 인턴으로 선정되어 해외 연수를 다녀온 일입니다"],     // 사람 멘트
            ["반갑습니다. 이지혜님. AI역량검사에 오신 것을 환영합니다", "마케팅에 있어 가장 중요한 것은 무엇인가요?", "실무 경험이 중요한 이유는 무엇인가요?", "관련 실무 경험이 있으신가요?", "인턴 경험 때 가장 기억에 남는 일은 무엇인가요?"],                // ai 멘트
            [{rapid:0.1, repeat:5, repeatDelay:0.05},
            {rapid:0.08, repeat:4, repeatDelay:0.05},
            {rapid:0.08, repeat:4, repeatDelay:0.05},
            {rapid:0.08, repeat:4, repeatDelay:0.05},
            {rapid:0.08, repeat:5, repeatDelay:0.05}
            ]
        );

        // graph , intro line모션
        scrollDetect.init([{
          ele: $(".intro_area_v2"),
          type: "common",
          duration:0,
          callback:function(dir, r){
            lineDraw.act();
          }
        },{
          ele: $(".process_area"),
          type: "common",
          duration:0,
          callback:function(dir, r){
            boxMov01.act();
          }
        },{
          ele: $(".s_tech_area"),
          type: "common",
          duration:0,
          callback:function(dir, r){
            boxMov02.act();
          }
        }]);
        // v4 영상 음소거
        v4VideoMute();

        // 가로 스크롤 초기화
        //reportScroll.init();
      };

      // inairAI return
    return {
      init:init,
        responsive:responsive
      }

      //--------------------------------- jobflex-ability 실행 코드----------------------------------------------------//
    })();

    //jobflex 언택트 ver2
  app.namespace("jobflexUntactV2");
  app.jobflexUntactV2 = (function(){    

    // pc에서만 슬라이드
    var pcSlide = (function(){
      var $slide;
      var device, prevDevice;

      var init = function(){
        $slide= $(".sec_slide .slider"),
        //device = app.mg.device;
        $slide.on("afterChange", function(event, slick, currentSlide){
          $('.circle_flag p').removeClass('on');
          $('.circle_flag p[data-slide='+ currentSlide + ']').addClass('on');
        });
        _act();
        $(window).resize(function(){
          _act();
        });
      };

      var _act = function(){
        device = app.mg.device;
        if(device != prevDevice) {
          if(device === "desktop"){
            $slide.not(".slick-initialized").slick({
              infinite: false,
              slidesToShow: 1,
              slidesToScroll: 1,
            });
          }else{
            if($slide.hasClass("slick-initialized")){
              $slide.slick("unslick");
            }
          }
        }    

        prevDevice = device;
      };

      return {
        init:init
      }
    })();

    //arrow 모션
    var arrowDraw = (function(){
      var device, $secWrap, $blueA, $greenA, $bxEr, $bxEe, bxH;
      var init = function(){
        device = app.mg.device;
        $secWrap = $('.sec_arrow.sec_cont');
        $bxEr = $secWrap.find('.bx_interview.er');
        $bxEe = $secWrap.find('.bx_interview.ee');
        $blueA = $secWrap.find('.bx_arrow.blue');
        $greenA = $secWrap.find('.bx_arrow.green');
        bxH = $blueA.height();
        if(device != 'desktop') return;
        $secWrap.find('.person').css('opacity','0');
        $blueA.find('.txt').css('opacity','0');
        $greenA.find('.txt').css('opacity','0');
        $blueA.css({'height':'0','opacity':0});
        $greenA.css({'height':'0','opacity':0})
      }
      var act = function(){
        device = app.mg.device;
        var tl = new TimelineLite;
        if(device != 'desktop') return;
        tl.to($secWrap.find('.person'), 0.4,{opacity:1, ease:"Quad.easeOut",delay:0.2})
          .to($secWrap.find('.bx_arrow'),0.4,{opacity:1,height:bxH, ease:"Quad.easeOut",delay:0.2})
          .to($secWrap.find('.bx_arrow').find('.txt'),0.2,{opacity:1,ease:"Quad.easeOut",delay:0.2});
      }
      return{
        init:init,
        act:act
      }
    })();

    //graph 모션
    var tGraphDraw = (function(){
      var device, $secWrap, $beforeB, $afterB;
      var init = function(){
        device = app.mg.device;
        $secWrap = $('.sec_compare.sec_cont');
        $beforeB = $secWrap.find('.before .graph');
        $afterB = $secWrap.find('.after .graph');
        if(device != 'desktop') return;
        TweenMax.set($secWrap.find('.graph'),{opacity:0,scale:0});
      }
      var act = function(){
        device = app.mg.device;
        var tl = new TimelineLite;
        if(device != 'desktop') return;
        tl.to($beforeB, 0.4,{opacity:1, scale:1, ease:"Quad.easeOut"})
          .to($afterB, 0.4,{opacity:1, scale:1, ease:"Quad.easeOut"})
      }
      return{
        init:init,
        act:act
      }
    })();
    //--------------------------------- untact 실행 코드----------------------------------------------------//
    var init = function(){
      var browser = app.mg.browser;
      pcSlide.init();
      arrowDraw.init();
      tGraphDraw.init();
      // graph 모션
      scrollDetect.init([{
        ele: $(".sec_arrow.sec_cont .inner_tp2"),
        type: "common",
        duration:'winH*0.5',
        callback:function(dir, r){
          arrowDraw.act();
        }
      },{
        ele: $(".sec_cont.sec_compare"),
        type: "common",
        duration:'winH * 0.5',
        callback:function(dir, r){
          tGraphDraw.act();
        }
      }]);
    };

    return {
      init:init
    }

    //--------------------------------- jobflex-untact V2 실행 코드----------------------------------------------------//
  })();
  
  //jobflex ai custom
  app.namespace("jobflexAiCustom");
  app.jobflexAiCustom = (function(){
    var visualMotion = (function(){
      var device, $secWrap=null, $motionList = [], cntFlag = false;
      var init = function(){
        device = app.mg.device;
        if(device != 'desktop') return;
        $secWrap = $('.sec_custom_visual');
        $motionList[0] = $secWrap.find('.visual_cont .order1');
        $motionList[1] = $secWrap.find('.visual_cont .order2');
        $motionList[2] = $secWrap.find('.visual_cont .order3');
        $motionList[3] = $secWrap.find('.visual_cont .order4');
        $motionList[0].addClass('ready');
        $motionList[1].addClass('ready');
        $motionList[2].addClass('ready');
        $motionList[3].addClass('ready');
      }
      var act = function(){
        device = app.mg.device;
        var tl1 = new TimelineLite;
        var tl2 = new TimelineLite;
        var tl3 = new TimelineLite;
        var tl4 = new TimelineLite;
        if(device != 'desktop') return;
        tl1.to($motionList[0],0.3,{opacity:0.71,ease:"Quad.easeOut",delay:0.3,onComplete:function(){$motionList[0].removeClass('ready')}})
           .to($motionList[0].find('em'),0.3,{opacity:1,scale:1,ease:"Quad.easeOut",delay:0.3});
        tl2.to($motionList[1],0.3,{opacity:1,ease:"Quad.easeOut",delay:0.8,onComplete:function(){$motionList[1].removeClass('ready')}})
           .to($motionList[1].find('em'),0.3,{opacity:1,scale:1,ease:"Quad.easeOut",delay:0.3});
        tl3.to($motionList[2],0.3,{opacity:0.48,ease:"Quad.easeOut",delay:1.5,onComplete:function(){$motionList[2].removeClass('ready')}})
           .to($motionList[2].find('em'),0.3,{opacity:1,scale:1,ease:"Quad.easeOut",delay:0.3});
        tl4.to($motionList[3],0.3,{opacity:0.53,ease:"Quad.easeOut",delay:2,onComplete:function(){$motionList[3].removeClass('ready')}})
           .to($motionList[3].find('em'),0.3,{opacity:1,scale:1,ease:"Quad.easeOut",delay:0.3})
        var actCnt = setInterval(function(){
          if(!cntFlag){
            $('.cnt').each(function () {
              $(this).css('opacity','1');
              $(this).next('.unit').css('opacity','1')
              var showCnt;
              $(this).prop('Counter',0).animate({
                Counter: $(this).text().toString().replace(/[^\d]+/g, "")
              }, {
                duration: 1500,
                easing: 'swing',
                step: function (now) {
                  showCnt = Math.ceil(now);
                  showCnt = showCnt.toString().replace(/\B(?=(\d{1})+(?!\d))/g, ".")
                  $(this).text(showCnt);
                }
              });
            });
            cntFlag = true;
            clearInterval(actCnt);
          }
        }, 2800);
      }
      return{
        init:init,
        act:act
      }
    })();
    var optMotion = (function(){
      var device, $secWrap = null, $tagWrap = null, motionFlag = false,el=[];
      var init = function(){
        $secWrap = $('.sec_custom_option .bx_opt');
        $tagWrap = $secWrap.find('.tag_wrap');
        device = app.mg.device;
        if(device != 'desktop') return;
        act();
      }
      var act = function(){
        TweenMax.to($tagWrap.find('.tg1'),0.3,{opacity:1,ease:"Quad.easeOut",delay:0.3})
        TweenMax.to($tagWrap.find('.tg2'),0.3,{opacity:1,ease:"Quad.easeOut",delay:2.4})
        TweenMax.to($tagWrap.find('.tg3'),0.3,{opacity:1,ease:"Quad.easeOut",delay:1.2})
        TweenMax.to($tagWrap.find('.tg4'),0.3,{opacity:1,ease:"Quad.easeOut",delay:0.9})
        TweenMax.to($tagWrap.find('.tg5'),0.3,{opacity:1,ease:"Quad.easeOut",delay:1.5})
        TweenMax.to($tagWrap.find('.tg6'),0.3,{opacity:1,ease:"Quad.easeOut",delay:0.6})
        TweenMax.to($tagWrap.find('.tg7'),0.3,{opacity:1,ease:"Quad.easeOut",delay:1.8})
        TweenMax.to($tagWrap.find('.tg8'),0.3,{opacity:1,ease:"Quad.easeOut",delay:2.1})
      }
      return{
        init:init
      }
    })();
    var stepMotion = (function(){
      var device, $secWrap = null, step=[],motionFlag = false;
      var init = function(){
        $secWrap = $('.sec_custom_step');
        device = app.mg.device;
        if(device != 'desktop'){
          motionFlag = true;
          return;
        }
        $secWrap.find('.circle_item').css('opacity','0');
        $secWrap.find('li').addClass('no_arrow');
        step[0] = $secWrap.find('.step01');
        step[1] = $secWrap.find('.step02');
        step[2] = $secWrap.find('.step03');
      }
      var act = function(){
        device = app.mg.device;
        var tl = new TimelineLite;
        if(device != 'desktop' && motionFlag === true){
          $secWrap.find('.circle_item').css('opacity','1');
          $secWrap.find('li').removeClass('no_arrow');
          return;
        }
        tl.to(step[0].find('.cir01'),0.4,{opacity:1,ease:"Quad.easeOut"})
          .to(step[0].find('.cir02'),0.4,{opacity:1,ease:"Quad.easeOut",delay:0.2,onComplete:function(){step[1].removeClass('no_arrow')}})
          .to(step[1].find('.cir03'),0.4,{opacity:1,ease:"Quad.easeOut",delay:0.6})
          .to(step[1].find('.cir04'),0.4,{opacity:1,ease:"Quad.easeOut",delay:0.2,onComplete:function(){step[2].removeClass('no_arrow')}})
          .to(step[2].find('.cir05'),0.4,{opacity:1,ease:"Quad.easeOut",delay:0.6})
        motionFlag = true;
      }
      return{
        init:init,
        act:act
      }
    })();
    var miracleGraph = (function(){
      var device, $secWrap = null, $graphB, $graphA;
      var init = function(){
        device = app.mg.device;
        if(device != 'desktop') return;
        $secWrap = $('.sec_custom_miracle');
        $graphB = $secWrap.find('.g_before');
        $graphA = $secWrap.find('.g_after');
      }
      var act = function(){

        device = app.mg.device;
        if(device != 'desktop') return;
        var tl1 = new TimelineLite;
        tl1.to($graphB.find('.l_1'), 0.4,{width:0,ease:"Linear.easeInOut"})
           .to($graphB.find('.l_2'), 0.4,{width:0,ease:"Linear.easeInOut",delay:0.2})
           .to($graphB.find('.l_3'), 0.4,{width:0,ease:"Linear.easeInOut",delay:0.2})
           .to($graphB.find('.l_4'), 0.4,{width:0,ease:"Linear.easeInOut",delay:0.2})
           .to($graphB.find('.g_area img'),0.6,{opacity:1,ease:"Quad.easeOut",delay:0.2})
           .to($graphA.find('.l_1'), 0.4,{width:0,ease:"Linear.easeInOut"})
           .to($graphA.find('.l_2'), 0.4,{width:0,ease:"Linear.easeInOut",delay:0.4})
           .to($graphA.find('.g_txt'), 0.4,{opacity:1,ease:"Linear.easeInOut",delay:0.4})
           .to($graphA.find('.g_area img'),0.6,{opacity:1,ease:"Quad.easeOut",delay:0.2})
      }
      return{
        init:init,
        act:act
      }
    })();
    //--------------------------------- ai custom 실행 코드----------------------------------------------------//
    var init = function(){
      var browser = app.mg.browser;
      var device = app.mg.device;
      if(device != 'desktop'){
        $('.sec_custom_visual').find('.visual_cont').removeClass('motion')
      }
      visualMotion.init();
      stepMotion.init();
      miracleGraph.init();
      if(window.pageYOffset == 0){
        visualMotion.act();
      }
      scrollDetect.init([{
        ele: $(".sec_custom_visual"),
        type: "common",
        duration:0,
        callback:function(dir, r){
          visualMotion.act();
        }
      },{
        ele: $(".sec_custom_option .opt02"),
        type: "common",
        duration:'winH * 0.5',
        callback:function(dir, r){
          optMotion.init();
        }
      },{
        ele: $(".sec_custom_step"),
        type: "common",
        duration:0,
        callback:function(dir, r){
          stepMotion.act();
        }
      },{
        ele: $(".sec_custom_miracle"),
        type: "common",
        duration:0,
        callback:function(dir, r){
          miracleGraph.act();
        }
      }]);
    };

    return {
      init:init
    }

    //--------------------------------- jobflex-ai custom 실행 코드----------------------------------------------------//
  })();
  
  // 메인 jobflexvisual
  app.namespace('mainJobflex');
  app.mainJobflex = (function(){
    var device, $motionWrap, $logoJob, $logoFlex, $obj;
    var init = function(ele, type){
      device = app.mg.device;
      $motionWrap = $('.main_item.jf_visual');
      $logoJob = $motionWrap.find('.logo_1');
      $logoFlex = $motionWrap.find('.flex_logo');
      $obj = $motionWrap.find('.bx_obj')

      if(app.mg.device != "desktop"){ 
        return;
      }
      TweenMax.set($logoJob,{opacity:0});
      TweenMax.set($logoFlex,{opacity:0});
      TweenMax.set($logoFlex.find('.logo_bg'),{opacity:0,left:'-131px'});
      TweenMax.set($logoFlex.find('.logo_2'),{x:'0'});
      var tl = new TimelineLite,tl2 = new TimelineLite;
      tl.to($logoJob, 0.3, {autoAlpha:1, ease:"Quad.easeOut", delay:0.2})
        .to($logoFlex, 0.3, {autoAlpha:1, ease:"Quad.easeOut"});

      TweenMax.to($logoFlex.find('.logo_2'),0.4,{x:'131',ease:"Quad.easeOut",delay:0.8});
      TweenMax.to($logoFlex.find('.logo_bg'),0.4,{autoAlpha:1,ease:"Quad.easeOut",delay:0.8});
      TweenMax.to($logoFlex.find('.logo_bg'),0.4,{left:'0',ease:"Quad.easeOut",delay:0.8});
      TweenMax.delayedCall(1.2,circleMotion);
    };
    var circleMotion = function(){
      var c01 =$obj.find('.c01'),
          c02 =$obj.find('.c02'),
          c03 =$obj.find('.c03'),
          c04 =$obj.find('.c04');
      TweenMax.set(c01.find('.border_line'),{width:'80%',height:'80%',opacity:0.6});
      TweenMax.set(c02.find('.border_line'),{width:'80%',height:'80%',opacity:0.6});
      TweenMax.set(c03.find('.border_line'),{width:'80%',height:'80%',opacity:0.6});
      TweenMax.set(c04.find('.border_line'),{width:'80%',height:'80%',opacity:0.6});
      TweenMax.set(c01.find('.gun'),{left:'0'});
      TweenMax.set(c02.find('.gun'),{left:'0'});
      TweenMax.set(c03.find('.gun'),{left:'0'});
      TweenMax.set(c01.find('li'),{opacity:0});
      TweenMax.set(c02.find('li'),{opacity:0});
      TweenMax.set(c03.find('li'),{opacity:0});
      TweenMax.set(c02.find('.cover'),{opacity:1})
      TweenMax.set(c03.find('.cover'),{opacity:1})
      TweenMax.set(c04.find('.cover'),{opacity:1})


      TweenMax.to(c01.find('.border_line'),0.5,{width:'140%',height:'140%',opacity:0,ease:"Quad.easeOut",delay:0.5});
      TweenMax.to(c01.find('li').eq(0),0.2,{opacity:'1',ease:"Quad.easeOut",delay:1});
      TweenMax.to(c01.find('li').eq(1),0.2,{opacity:'1',ease:"Quad.easeOut",delay:1.4});
      TweenMax.to(c01.find('li').eq(2),0.2,{opacity:'1',ease:"Quad.easeOut",delay:1.8});
      TweenMax.to(c01.find('li').eq(3),0.2,{opacity:'1',ease:"Quad.easeOut",delay:2.2});
      TweenMax.to(c01.find('.gun'),1.5,{left:'100%',ease:"Quad.easeOut",delay:2.2});
      TweenMax.to(c02.find('.border_line'),0.5,{width:'140%',height:'140%',opacity:0,ease:"Quad.easeOut",delay:3});
      TweenMax.to(c02.find('.cover'),0.1,{opacity:'0',ease:"Quad.easeOut",delay:3});
      TweenMax.to(c02.find('li').eq(0),0.2,{opacity:'1',ease:"Quad.easeOut",delay:4});
      TweenMax.to(c02.find('li').eq(1),0.2,{opacity:'1',ease:"Quad.easeOut",delay:4.4});
      TweenMax.to(c02.find('li').eq(2),0.2,{opacity:'1',ease:"Quad.easeOut",delay:4.8});
      TweenMax.to(c02.find('li').eq(3),0.2,{opacity:'1',ease:"Quad.easeOut",delay:5.2});
      TweenMax.to(c02.find('.gun'),1.5,{left:'100%',ease:"Quad.easeOut",delay:5.2});
      TweenMax.to(c03.find('.border_line'),0.5,{width:'140%',height:'140%',opacity:0,ease:"Quad.easeOut",delay:6});
      TweenMax.to(c03.find('.cover'),0.1,{opacity:'0',ease:"Quad.easeOut",delay:6});
      TweenMax.to(c03.find('li').eq(0),0.2,{opacity:'1',ease:"Quad.easeOut",delay:7});
      TweenMax.to(c03.find('li').eq(1),0.2,{opacity:'1',ease:"Quad.easeOut",delay:7.2});
      TweenMax.to(c03.find('.gun'),1.5,{left:'100%',ease:"Quad.easeOut",delay:7.2});
      TweenMax.to(c04.find('.cover'),0.1,{opacity:'0',ease:"Quad.easeOut",delay:8});
      TweenMax.to(c04.find('img'),0.2,{scale:'1.1',ease:"Quad.easeOut",delay:8});
      TweenMax.to(c04.find('img'),0.2,{scale:'1',ease:"Quad.easeOut",delay:8.2});
      TweenMax.to(c04.find('.border_line'),0.5,{width:'140%',height:'140%',opacity:0,ease:"Quad.easeOut",delay:8.2});
    };
    return {
      init:init
    }
  })();
})
//------------------------MYAPP 종료------------------------------