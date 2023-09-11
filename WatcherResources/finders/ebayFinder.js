const cheerio = require('cheerio');
const { getHtml } = require('../watcher_http');

module.exports = 
{
    domain: "ebay",
    async check(url)
    {
        const shortUrl = url.split('?')[0];
        const html = await getHtml(shortUrl);
        const $ = cheerio.load(html);
        const mainContent = $('#LeftSummaryPanel #mainContent form');
        if(mainContent.length < 1) return 500;
        const picturePanel = $('#PicturePanel');
        const bottomPanel = $('#BottomPanel');
        const sellerBase = bottomPanel.find('div.tabbable div.vim.d-stores-info-categories div.d-stores-info-categories__wrapper div.d-stores-info-categories__container div.d-stores-info-categories__container__info');
        const variablePrice = mainContent.find('div.vim-buybox-wrapper div.x-bin-price__content').text().split('US ')[1] !== undefined ? mainContent.find('div.vim-buybox-wrapper div.x-bin-price__content').text().split('US ')[1] : mainContent.find('div.vim-buybox-wrapper div.x-bid-price__content').text().split('US ')[1];
        let variableShipping = $('#SRPSection div.vim.d-shipping-minview div.ux-layout-section__row div.ux-labels-values__values.col-9 div.ux-labels-values__values-content').text().split('US ')[1];
        variableShipping = variableShipping !== undefined ? variableShipping.split(' ')[0].replace(')', '').split(' ')[0] : 'No Especificado';
        if(variablePrice === undefined) return 500;
        const item = 
        {
          name: $('#vi-lkhdr-itmTitl').text(),
          state: mainContent.find('div.nonActPanel div.vim.x-item-condition div.x-item-condition-value div.x-item-condition-text span.clipped').text(),
          auction: mainContent.find('div.nonActPanel div.vim.x-timer-module').length > 0,
          auction_time_left: mainContent.find('div.nonActPanel div.vim.x-timer-module span.x-timer-module__timer span.ux-timer__text').text(),
          price: variablePrice, 
          shipping: variableShipping,
          refundable: mainContent.find('div.vim.x-wtb-signals div.ux-section-module.section-module- div.ux-section-icon-with-details div.ux-icon.ux-section-icon-with-details__icon-wrapper span').hasClass('RETURN'),
          vendorInfo: {
            porfilePicture: sellerBase.find('a.d-stores-info-categories__container__info__image img').attr('src'),
            username: sellerBase.find('div.d-stores-info-categories__container__info__section h2').text(),
            extraInfo: sellerBase.find('div.d-stores-info-categories__container__info__section div.d-stores-info-categories__container__info__section__item').text().replace('Feedback', 'Feedback ').replace('positivos', 'positivos '),
            userUrl: sellerBase.find('div.d-stores-info-categories__container__info__section a').attr('href').split('?')[0]
          },
          imageUrl: picturePanel.find('div.vim.d-picture-panel div.d-picture-minview__container div div.ux-image-carousel-container div.ux-image-carousel-item.active.image img').attr('src'),
          url: shortUrl,
        }

        return item;
    },
    async find(toFind, auction = false)
    {
        const html = await getHtml(`https://www.ebay.com/sch/i.html?&_nkw=${toFind}&_sop=10` + (auction ? "&LH_Auction=1" : "&LH_BIN=1"))
        const $ = cheerio.load(html);
        const itemsCode = $('#srp-river-main #srp-river-results ul.srp-results.srp-list.clearfix li.s-item');
        const itemsCodeArray = itemsCode.toArray();
        let items = [];
        itemsCodeArray.forEach(item => {
          const itemInfo = $(item).find('div.s-item__wrapper.clearfix div.s-item__info.clearfix');
          const itemDetails = $(item).find('div.s-item__wrapper.clearfix div.s-item__info.clearfix .s-item__details.clearfix .s-item__detail.s-item__detail--primary');
          const itemDetails_Secondary = $(item).find('div.s-item__wrapper.clearfix div.s-item__info.clearfix .s-item__details.clearfix .s-item__detail.s-item__detail--secondary');
          const itemImage = $(item).find('div.s-item__wrapper.clearfix .s-item__image-section .s-item__image img').attr("src");
          let shipping_ = itemDetails.find(".s-item__shipping.s-item__logisticsCost").text();
          if(shipping_.startsWith("+")) shipping_ = shipping_.slice(1).split(" ")[0].replace("USD", "$");
          let extraPrice_ = itemDetails.find(".s-item__dynamic.s-item__purchaseOptionsWithIcon").text()
          if(extraPrice_.startsWith("¡"))extraPrice_ = "";
          const itemBuilded = {
            name: itemInfo.find("a div.s-item__title span").text().replace('New Listing', ''),
            auction_state: auction ? itemDetails.find("span.s-item__time").text()+" "+itemDetails.find(".s-item__bids.s-item__bidCount").text() : null,
            state: itemInfo.find(".s-item__subtitle .SECONDARY_INFO").text(),
            vendor: itemDetails_Secondary.find(".s-item__seller-info .s-item__seller-info-text").text(),
            price: itemDetails.find("span.s-item__price").text().replace("USD", "$") + (extraPrice_ !== "" ? " "+extraPrice_.replace("USD", "$"): ""),
            shipping: shipping_,
            imgUrl: itemImage,
            url: itemInfo.find("a").attr("href").split("?")[0]
          };

          items.push(itemBuilded);
        });

        return items;

    }
}