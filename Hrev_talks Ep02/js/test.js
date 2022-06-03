
  $(document).ready(function() {
    $('.mainvisual .visual>img').addClass('on');
    $('.sect_about .inner>.txts').addClass('on');

    $(document).on('click', '.hbspt-form .hs_check span>a', function() {
      console.log('모달1 클릭');
      $('html,body').css('overflow','hidden');
      $('.wrap_modal').addClass('on');
      $('.modal_privacy').addClass('on');
    });

    $(document).on('click', '.hbspt-form .hs_checkbox span>a', function() {
      console.log('모달2 클릭');
      $('html,body').css('overflow','hidden');
      $('.wrap_modal').addClass('on');
      $('.modal_marketing').addClass('on');
    });

    $('.wrap_modal .btn_close').on('click',function() {
      $('html,body').css('overflow','auto');
      $('.wrap_modal').removeClass('on');
      $('div[class^="modal_"]').removeClass('on');
    });
    
    $(document).on('click', '.wrap_modal .dim', function (e) {
      $('html,body').css('overflow','auto');
      
      if($('.modal_privacy').hasClass('on')) {
        console.log('dim 클릭');
        $('.modal_privacy').removeClass('on');
        $('.wrap_modal').removeClass('on');
      }
      if($('.modal_marketing').hasClass('on')) {
        console.log('dim 클릭');
        $('.modal_marketing').removeClass('on');
        $('.wrap_modal').removeClass('on');
    }
    
    $(document).on('focus', 'input', function() {
      console.log('focused');
      $('input').parent('.input').siblings('label').find('span').css('color','#cfcfcf');
      $(this).parent('.input').siblings('label').find('span').css('color','#fff');
    });

    $(document).on('blur', 'input', function() {
      console.log('blurred');
      $('label').find('span').css('color','#cfcfcf');
    });
    
    $(document).on('focus', 'select', function() {
      console.log('focused');
      $('input').parent('.input').siblings('label').find('span').css('color','#cfcfcf');
      $('select').parent('.input').siblings('label').find('span').css('color','#cfcfcf');
      $(this).parent('.input').siblings('label').find('span').css('color','#fff');
    });
    
    $(document).on('blur', 'select', function() {
      console.log('blurred');
      $('label').find('span').css('color','#cfcfcf');
    });
      
    });
  });
  $(window).resize(function(){
    resizeYoutube();
  });
  $(function() {
    resizeYoutube();
  });
  function resizeYoutube(){
    $("iframe").each(function(){
      if( /^https?:\/\/www.youtube.com\/embed\//g.test($(this).attr("src")) ) {
        $(this).css("width","100%");
        $(this).css("height",Math.ceil( parseInt($(this).css("width")) * 480 / 854 ) + "px");
      }
    });
  }