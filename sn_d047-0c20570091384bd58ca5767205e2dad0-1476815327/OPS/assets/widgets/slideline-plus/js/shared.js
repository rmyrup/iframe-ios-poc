
   /*exported getLayoutKeys*/

  // first is always the default - both caption and label at bottom is the default
  function getLayoutKeys(){
    return [{name:"LbotCbot", config:"label and caption below image", desc:"Label, Caption Below Image", htmlString:'<div id="slide_images" role="region" aria-label="slide"></div><div class="slide_info slider_location"><div id="slide_labels" role="region" aria-label="label"></div><div id="slide_captions" role="region" aria-label="caption"></div></div>'},
            {name:"LtopCbot", config:"label above and caption below image", desc:"Label Above, Caption Below", htmlString:'<div class="slide_info"><div id="slide_labels" role="region" aria-label="label"></div></div><div id="slide_images" role="region" aria-label="slide"></div><div class="slide_info slider_location"><div id="slide_captions" role="region" aria-label="caption"></div></div>'},
            {name:"LtopCtop", config:"label and caption above image", desc:"Label, Caption Above Image", htmlString:'<div class="slide_info"><div id="slide_labels" role="region" aria-label="label"></div><div id="slide_captions" role="region" aria-label="caption"></div></div><div id="slide_images" role="region" aria-label="slide"></div><div class="slide_info slider_location"></div></div>'}
            ];
  }

