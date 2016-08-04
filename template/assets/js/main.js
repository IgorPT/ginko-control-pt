if ($('.cycle-slideshow .slide').length > 1) {
    $('.cycle-slideshow').cycle({
        fx: "scrollHorz",
        slides: "> div",
        pager:".example-pager",
        prev: ".prev",
        next: ".next"
    });
} else {
    $('.headerSlide .sliders .arrowCenter, .headerSlide .sliders .pager').addClass('hidden');
}

var newsBlockLen = $('.product-slideshow').children().length,
  tempItems = [],
  helperClass;

$('.product-slideshow').children().each(function(key, val) {
    tempItems.push(val);

    if(key % 3 === 0){
      helperClass = 'block_'+key;
      $('.product-slideshow').append('<div class="productSlide '+helperClass+'"></div>');
    }

    if(key % 3 === 2){
      $('.product-slideshow .'+helperClass).html(tempItems);
      tempItems = [];
    } else if (newsBlockLen == key+1) {
      $('.product-slideshow .'+helperClass).html(tempItems);
    }
});

$(document).ready(function () {
    
    $('a').click(function() {
        if ($(this).attr('href') == '#' || $(this).attr('href') == '') {
            return false;
        };
    })
    
    var bodyClass = $('body').attr('class');
        bodyClass = bodyClass.split('-')[1];
    
    if (bodyClass != 'page-home') {
        $('.mainMenu a').each(function(e, i) {
            
            if (/\w+/.test($(this).text())) {
                var regex = new RegExp($(this).text().replace('í', 'i').split(' ').join('|'), 'ig'),
                    el = $(this);

                if (regex.test(bodyClass) === true){
                    el.addClass('active');
                }
            }
        });
    }
    
    $('.product-slideshow').cycle({
        fx: "fade",
        slides: "> div",
        pager:".product-pager",
        prev: ".prev",
        next: ".next",
    });
    

    $('.btnBuy').unbind('click').bind('click', function() {
        var btnClasses = $(this).attr('class').split(' '),
            lb;

        $('.sectionLightBox').fadeIn(250, function() {
            lb = $('.sectionLightBox').find('.productInfo.'+btnClasses[btnClasses.length-1]);
            lb.fadeIn(250);
        });

        return false;
    });

    $('.sectionLightBox').unbind().bind('click', function() {
        $(this).children('.productInfo:visible').fadeOut(250, function() {
            $('.sectionLightBox').fadeOut(250);
        });
    });

    $('.sectionLightBox .closeLightBox').unbind().bind('click', function() {
        $(this).parent('.productInfo').fadeOut(250, function() {
            $('.sectionLightBox').fadeOut(250);
        });
    });

        $('.menu-hamburguer').click(function() {
          $('.menu-hamburguer-expand').slideToggle('slow');
        });

        $('.faqGroup .faqQuestions').click(function(){
          $('.openBox').not(this).removeClass('openBox').parent().children('.faqAnswer').slideToggle();
          $(this).toggleClass('openBox');
          $(this).parent().children('.faqAnswer').slideToggle();
        })

        $('.diamond').click(function () {
            $("html, body").animate({
                scrollTop: 0
            }, 600);
            return false;
        });

       /* $('.fullArticle').click(function(){
            $(this).parent().children('.newsTxtBlock').children('p').css('height','auto');
            $(this).children('.btnReadMore').css('display','none');
            return false;
        })*/

    })
function startmain() {

    $(window).resize(function () {
        //$.refreshBackgroundDimensions( $('.head') );

    })

    /*	$.getScript( "js/jquery.backgroundSize.js", function( data ) {
    		$('.bannercontainer').css({'backgroundSize': "cover"});
    	})*/
}
