/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 jquery.mb.components
 
 file: mbScrollable.js
 last modified: 5/18/15 9:31 PM
 Version:  {{ version }}
 Build:  {{ buildnum }}
 
 Open Lab s.r.l., Florence - Italy
 email:  matteo@open-lab.com
 blog: 	http://pupunzi.open-lab.com
 site: 	http://pupunzi.com
 	http://open-lab.com
 
 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 
 Copyright (c) 2001-2018. Matteo Bicocchi (Pupunzi)
 :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/

/*
 * Name:jquery.mb.scrollable
 * Version: 1.7.0
 */

(function($) {
	$.mbScrollable= {
		plugin:"mb.scrollable",
		author:"Matteo Bicocchi",
		version:"1.7.0",
		defaults:{
			dir:"horizontal",
			textDir:"ltr",
			width:980,
			elementsInPage:4,
			elementMargin:2,
			shadow:false,
			height:"auto",
			controls:"#controls",
			slideTimer:600,
			autoscroll:false,
			scrollTimer:6000,

			loadCallback:function(){},
			nextCallback:function(){},
			prevCallback:function(){},
			changePageCallback:function(){}
		},

		buildMbScrollable: function(options){
			return this.each (function (){
				this.options = {};
				$.extend (this.options, $.mbScrollable.defaults);
				$.extend (this.options, options);

				var mbScrollable=this;
				mbScrollable.isVertical= mbScrollable.options.dir!="horizontal";
				var controls=$(mbScrollable.options.controls);
				mbScrollable.idx=1;
				mbScrollable.scrollTo=0;
				mbScrollable.elements= $(mbScrollable).children();
				mbScrollable.elements.addClass("scrollEl");
				controls.hide();

				$(mbScrollable).children().each(function(){$(this).wrap("<div class='SECont'></div>");});
				if (mbScrollable.options.shadow){
					$(mbScrollable.elements).css("-moz-box-shadow",mbScrollable.options.shadow);
					$(mbScrollable.elements).css("-webkit-box-shadow",mbScrollable.options.shadow);
				}
				mbScrollable.elements= $(mbScrollable).children();
				var eip= mbScrollable.options.elementsInPage<this.elements.size()?mbScrollable.options.elementsInPage:mbScrollable.elements.size();
				if(mbScrollable.isVertical){
					mbScrollable.singleElDim= Math.floor((mbScrollable.options.height/eip)-mbScrollable.options.elementMargin);
					$(mbScrollable.elements).css({marginBottom:mbScrollable.options.elementMargin, height:mbScrollable.singleElDim, width:mbScrollable.options.width});
				}else{
					mbScrollable.singleElDim= Math.floor((mbScrollable.options.width/eip)-mbScrollable.options.elementMargin);
					$(mbScrollable.elements).css({marginRight:mbScrollable.options.elementMargin, width:mbScrollable.singleElDim, display:"inline-block","float":"left" });
				}
				this.elementsDim= (mbScrollable.singleElDim*mbScrollable.elements.size())+(mbScrollable.options.elementMargin*mbScrollable.elements.size());
				mbScrollable.totalPages= Math.ceil(mbScrollable.elements.size()/mbScrollable.options.elementsInPage);

				if(mbScrollable.isVertical)
					$(mbScrollable).css({overflow:"hidden", height:((mbScrollable.singleElDim+mbScrollable.options.elementMargin)*mbScrollable.options.elementsInPage), paddingRight:5, position:"relative"});
				else
					$(mbScrollable).css({overflow:"hidden", width:((mbScrollable.singleElDim+mbScrollable.options.elementMargin)*mbScrollable.options.elementsInPage),height:mbScrollable.options.height,paddingBottom:5, position:"relative"});

				var mbScrollableStrip=$("<div class='scrollableStrip'/>").css({width:mbScrollable.elementsDim, position:"relative"});
				$(mbScrollable.elements).wrapAll(mbScrollableStrip);
				mbScrollable.mbscrollableStrip=$(mbScrollable).find(".scrollableStrip");
				$(mbScrollable.elements).hover(
						function(){
							if(mbScrollable.autoScrollActive)
								$(mbScrollable).mbStopAutoscroll();
						},
						function(){
							if(mbScrollable.autoScrollActive)
								$(mbScrollable).mbAutoscroll();
						});
				if(mbScrollable.options.autoscroll && mbScrollable.elements.size()>mbScrollable.options.elementsInPage){
					mbScrollable.autoScrollActive=true;
					$(mbScrollable).mbAutoscroll();
				}
				$(mbScrollable).mbPageIndex();
				$(mbScrollable).mbActivateControls();
				setTimeout(function(){
					$(".scrollEl").fadeIn();
				},1000);
				$(mbScrollable).mbManageControls();
			});
		},

		mbNextPage: function(auto){
			var mbScrollable= $(this).get(0);
			if (!auto) mbScrollable.autoScrollActive=false;

			if(mbScrollable.idx==mbScrollable.totalPages){
				$(mbScrollable).mbManageControls();
				return;
			}
			mbScrollable.idx+=1;
			$(mbScrollable).goToPage(mbScrollable.idx,false);
			if(mbScrollable.options.nextCallback)
				mbScrollable.options.nextCallback(mbScrollable);
		},

		mbPrevPage: function(auto){
			var mbScrollable= $(this).get(0);
			if (!auto) mbScrollable.autoScrollActive=false;

			if(mbScrollable.idx==1){
				$(mbScrollable).mbManageControls();
				return;
			}

			mbScrollable.idx-=1;
			$(mbScrollable).goToPage(mbScrollable.idx,false);
			if(mbScrollable.options.prevCallback)
				mbScrollable.options.prevCallback(mbScrollable);

		},

		mbFirstPage: function(){
			var mbScrollable= $(this).get(0);

			mbScrollable.idx=1;
			$(mbScrollable).goToPage(mbScrollable.idx,false);

		},

		mbLastPage: function(){
			var mbScrollable= $(this).get(0);
			mbScrollable.idx=mbScrollable.totalPages;
			$(mbScrollable).goToPage(mbScrollable.idx,false);
		},

		mbPageIndex: function(){
			var mbScrollable= $(this).get(0);
			var controls=$(mbScrollable.options.controls);
			var pages=controls.find(".pageIndex");
			if (pages){
				var n=0;
				for(var i=1;i<=mbScrollable.totalPages;i++){
					n++;
					var p=$("<span class='page'> "+n+" <\/span>").bind("click",function(){
						mbScrollable.autoScrollActive=false;
						$(mbScrollable).goToPage($(this).html(),false)
					});
					pages.append(p);
				}
			}
		},
		mbAutoscroll:function(){
			var dir= "next";
			var mbScrollable= $(this).get(0);
			mbScrollable.autoScrollActive=true;

			if(mbScrollable.autoscroll) return;
			var timer=mbScrollable.options.scrollTimer+mbScrollable.options.slideTimer;
			mbScrollable.autoscroll = true;
			mbScrollable.auto = setInterval(function(){
				dir= mbScrollable.idx==1?"next":mbScrollable.idx==mbScrollable.totalPages?"prev":dir;
				if(dir=="next")
					$(mbScrollable).mbNextPage(true);
				else
					$(mbScrollable).mbPrevPage(true);
			},timer);
			$(mbScrollable).mbManageControls();
		},

		mbStopAutoscroll: function(){
			var mbScrollable= $(this).get(0);
			mbScrollable.autoscroll = false;
			clearInterval(mbScrollable.auto);
			$(mbScrollable).mbManageControls();

		},

		mbActivateControls: function(){
			var mbScrollable=$(this).get(0);

			if(mbScrollable.options.loadCallback)
				mbScrollable.options.loadCallback(mbScrollable);

			var controls=$(mbScrollable.options.controls);
			controls.find(".first").bind("click",function(){$(mbScrollable).mbFirstPage();});
			controls.find(".prev").bind("click",function(){$(mbScrollable).mbStopAutoscroll();$(mbScrollable).mbPrevPage();});
			controls.find(".next").bind("click",function(){$(mbScrollable).mbStopAutoscroll();$(mbScrollable).mbNextPage();});
			controls.find(".last").bind("click",function(){$(mbScrollable).mbLastPage();});
			controls.find(".start").bind("click",function(){$(mbScrollable).mbAutoscroll();});
			controls.find(".stop").bind("click",function(){$(mbScrollable).mbStopAutoscroll();mbScrollable.autoScrollActive=false;});
		},

		mbManageControls: function(){
			var mbScrollable=$(this).get(0);
			var controls=$(mbScrollable.options.controls);
			if (mbScrollable.elements.size()<=mbScrollable.options.elementsInPage){
				controls.hide();
			}else{
				controls.show();
			}

			if (mbScrollable.idx==mbScrollable.totalPages){
				controls.find(".last, .next").addClass("disabled");
			}else{
				controls.find(".last, .next").removeClass("disabled");
			}

			if (mbScrollable.idx==1){
				controls.find(".first, .prev").addClass("disabled");
			}else{
				controls.find(".first, .prev").removeClass("disabled");
			}

			if (mbScrollable.autoscroll){
				controls.find(".start").addClass("sel");
				controls.find(".stop").removeClass("sel");
			}else{
				controls.find(".start").removeClass("sel");
				controls.find(".stop").addClass("sel");
			}
			controls.find(".page").removeClass("sel");
			controls.find(".page").eq(mbScrollable.idx-1).addClass("sel");
			controls.find(".idx").html(mbScrollable.idx+" / "+mbScrollable.totalPages);
		},

		goToPage: function(i,noAnim) {
			var mbScrollable= $(this).get(0);
			var anim= noAnim?0:mbScrollable.options.slideTimer;
			if (i>mbScrollable.totalPages) i=mbScrollable.totalPages;
			mbScrollable.scrollTo=-((mbScrollable.singleElDim+mbScrollable.options.elementMargin)*(mbScrollable.options.elementsInPage*(i-1)));
			if(mbScrollable.isVertical){
				if (mbScrollable.scrollTo<-mbScrollable.elementsDim+mbScrollable.options.height)
					mbScrollable.scrollTo=-mbScrollable.elementsDim+mbScrollable.options.height;
				$(mbScrollable.mbscrollableStrip).animate({marginTop:mbScrollable.scrollTo},anim);
			}else{
				if (mbScrollable.scrollTo<-mbScrollable.elementsDim+mbScrollable.options.width)
					mbScrollable.scrollTo=-mbScrollable.elementsDim+mbScrollable.options.width;
				$(mbScrollable.mbscrollableStrip).animate({marginLeft:mbScrollable.scrollTo},anim);
			}
			mbScrollable.idx = Math.floor(i);
			$(mbScrollable).mbManageControls();
			if (!mbScrollable.autoScrollActive)
				$(mbScrollable).mbStopAutoscroll();

			if(mbScrollable.options.changePageCallback)
				mbScrollable.options.changePageCallback(mbScrollable)
		}
	};

	$.fn.mbScrollable=$.mbScrollable.buildMbScrollable;
	$.fn.mbNextPage=$.mbScrollable.mbNextPage;
	$.fn.mbPrevPage=$.mbScrollable.mbPrevPage;
	$.fn.mbFirstPage=$.mbScrollable.mbFirstPage;
	$.fn.mbLastPage=$.mbScrollable.mbLastPage;
	$.fn.mbPageIndex=$.mbScrollable.mbPageIndex;
	$.fn.mbAutoscroll=$.mbScrollable.mbAutoscroll;
	$.fn.mbStopAutoscroll=$.mbScrollable.mbStopAutoscroll;
	$.fn.mbActivateControls=$.mbScrollable.mbActivateControls;
	$.fn.mbManageControls=$.mbScrollable.mbManageControls;
	$.fn.goToPage=$.mbScrollable.goToPage;

})(jQuery);
