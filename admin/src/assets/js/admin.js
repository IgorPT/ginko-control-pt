 // Anonymous "self-invoking" function
 (function() {

     if (typeof(jQuery) == 'undefined') {
         // Load the script

         var script = document.createElement("script");
         script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';
         script.type = 'text/javascript';
         document.getElementsByTagName("head")[0].appendChild(script);
     }
     // Poll for jQuery to come into existance
     var checkReady = function(callback) {
         if (window.jQuery) {
             callback(jQuery);
         } else {
             window.setTimeout(function() { checkReady(callback); }, 100);
         }
     };

     // Start polling...
     checkReady(function($) {


       loadjscssfile('http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css', 'css');
         loadjscssfile('/admin/assets/css/animate.min.css', 'css');
         loadjscssfile('/admin/assets/css/sidebar.css', 'css');


         $('body').append('<div class="lightbox animated fadeInLeft"><div class="lightboxClose"><i class="fa fa-times"></i></div><iframe  id="contentIframe" width="100" src="" frameborder="0"></div></div>')
                  .append('<div class="urtype_sidebar"><div class="urtype_menu"><ul class="sidebar_menu"></ul></div></div>')
                  .append('<div id="overlay"></div>');


         $.ajax({
                 url: '/api/infoupdate',
                 type: 'post',
                 dataType: 'json'
             })
             .done(function(a) {
                 menusData(a);
             })

         function loadjscssfile(filename, filetype) {
             if (filetype == "js") {
                 var fileref = document.createElement('script')
                 fileref.setAttribute("type", "text/javascript")
                 fileref.setAttribute("src", filename)
             } else if (filetype == "css") {
                 var fileref = document.createElement("link")
                 fileref.setAttribute("rel", "stylesheet")
                 fileref.setAttribute("type", "text/css")
                 fileref.setAttribute("href", filename)
             }
             if (typeof fileref != "undefined")
                 document.getElementsByTagName("head")[0].appendChild(fileref)
         }

         function menusData(a) {


             $('ul.sidebar_menu').append('<li class="logo"><i class="fa fa-magnet"></i> rtype</li>');
             for (var item in a.menus.admin) {
                 $('ul.sidebar_menu').append('<li><a title="'+ a.menus.admin[item].name +'" href="' + a.menus.admin[item].path + '" class="sidebarMenu"><i class="fa fa-' + a.menus.admin[item].icon + '"></i><span>' + a.menus.admin[item].name + '</span></li>');
             }

             $('.lightbox .lightboxClose,#overlay').unbind('click').bind('click', function() {
                $('#overlay').fadeOut();
                $('.lightbox').attr('class', '').addClass('lightbox animated fadeOutLeft');
             });

             $('a.sidebarMenu').unbind('click').bind('click', function() {
               //SHOW OVERLAY
                $('#overlay').show();
                 $('.lightbox').show();
                 $('.lightbox').attr('class', '').addClass('lightbox animated fadeInLeft');
                 //ADD CLASS TO ACTIVE MENU
                 $('a.sidebarMenu').removeClass('active');
                 $(this).addClass('active');

                  $('#contentIframe').attr('src', '/admin/'+$(this).attr('href'))

             });



         };
     });
 })();
