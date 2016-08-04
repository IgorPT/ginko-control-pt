$(document).ready(function () {
        $('.cycle-slideshow').cycle({
            Fx: "scrollHorz",
            slides: "> div",
            pager:".example-pager"
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

        $('.fullArticle').click(function(){
            $(this).parent().children('.newsTxtBlock').children('p').css('height','auto');
            $(this).children('.btnReadMore').css('display','none');
        })
        
    })
function startmain() {

    $(window).resize(function () {
        //$.refreshBackgroundDimensions( $('.head') );

    })

    /*	$.getScript( "js/jquery.backgroundSize.js", function( data ) {
    		$('.bannercontainer').css({'backgroundSize': "cover"});
    	})*/
}
