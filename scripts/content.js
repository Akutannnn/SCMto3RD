// OPTIONS
const BuffEnabled = true;
const PricempireEnabled = true;


console.log("SCM to 3rd party extension loaded.");


//ITEM NAME EXTRACTION
const URL = window.location.href;
String(URL);


let itemName;
let itemNamedec;

if (URL.includes("steamcommunity.com/market/listings/730")) {

    itemName = URL.split("/730/")[1];
    itemName = itemName.split("?l")[0];

    itemNamedec = decodeURIComponent(itemName);
};



//INSERTION LOGIC
const isCommodityItem = !!document.querySelector('.market_commodity_order_block');

let wheretoinsert;

if (isCommodityItem) {
    wheretoinsert = document.querySelector('.market_commodity_order_block');  
}
else {
    wheretoinsert = document.getElementById('largeiteminfo_warning');
};


let whattoinsert = `<div id="SCM3RD">`;
whattoinsert += ` `;

let itemsDataPromise;

    function loadItemsData() {
    if (!itemsDataPromise) {
        const url = chrome.runtime.getURL('scripts/data/marketids.json');
        itemsDataPromise = fetch(url).then(r => r.json());
    }
    return itemsDataPromise;
    };


//BUFF163 INTEGRATION
if (BuffEnabled) {

    const buffimgurl = chrome.runtime.getURL('scripts/images/buff163icon.png');

    function fetchBuff() {
        return loadItemsData().then((data) => {
        const buffID = data.items[itemNamedec].buff163_goods_id;
        const buffURL = 'https://buff.163.com/goods/' + buffID;
        if (buffURL==undefined){
            console.log("Error : No BuffURL");
        } else {
            let buffinsert = `<a href="${buffURL}" target="_blank"><img class="icons" src="${buffimgurl}" alt="Buff163"></a>`;
            whattoinsert += buffinsert;
            whattoinsert += ` `;
        };
    })};
};


//PRICEMPIRE INTEGRATION (ONLY FOR SKINS)
if (PricempireEnabled) {
    if (itemNamedec.includes("Factory New") || itemNamedec.includes("Minimal Wear") || itemNamedec.includes("Field-Tested") || itemNamedec.includes("Well-Worn") || itemNamedec.includes("Battle-Scarred")) {

        const pricempireimgurl = chrome.runtime.getURL('scripts/images/pricempireicon.png');
        let PricempireURL = "https://pricempire.com/cs2-items/skin/"
        let stattrak = false;
        let souvenir = false;
        let condition = null;

        //StatTrak check
        if (itemNamedec.includes("StatTrak™")) {
            stattrak = true;
        };

        //Souvenir check
        if (itemNamedec.includes("Souvenir")) {
            souvenir = true;
        };

        //Condition check
        if (itemNamedec.includes("Factory New")) {
            condition = "factory-new";
        }
        else if (itemNamedec.includes("Minimal Wear")) {
            condition = "minimal-wear";
        }
        else if (itemNamedec.includes("Field-Tested")) {
            condition = "field-tested";
        }
        else if (itemNamedec.includes("Well-Worn")) {
            condition = "well-worn";
        }
        else if (itemNamedec.includes("Battle-Scarred")) {
            condition = "battle-scarred";
        }

        //Get Weapon
        let weaponname = itemNamedec.split(" | ")[0];
        weaponname = weaponname.replace("StatTrak™ ", "");
        weaponname = weaponname.replace("Souvenir ", "");
        weaponname = weaponname.replace(" ", "-");
        weaponname = weaponname.toLowerCase();

        //Get Finish
        let finishname = itemNamedec.split(" | ")[1];

        const conditions = ["(Factory New)", "(Minimal Wear)", "(Field-Tested)", "(Well-Worn)", "(Battle-Scarred)"];
        const re = conditions.join("|");
        const regex = new RegExp(`\\s*\\((${re})\\)\\s*`);
        finishname = finishname.replace(regex, "");


        finishname = finishname.replace(" ", "-");
        finishname = finishname.toLowerCase();

        //Construct URL
        PricempireURL += weaponname + "-" + finishname;
        if (stattrak) {
            PricempireURL += "?variant=stattrak" + "-" + condition;
        }
        if (souvenir) {
            PricempireURL += "&variant=souvenir" + "-" + condition;
        }
        else if (!stattrak && !souvenir) {
        PricempireURL += "?variant=" + condition;
        }
        let pricempireinsert = `<a href="${PricempireURL}" target="_blank"><img class="icons" src="${pricempireimgurl}" alt="Pricempire"></a>`;
        whattoinsert += pricempireinsert;
        whattoinsert += ` `;
    }    
};




Promise.all([fetchBuff()]).then(() => {
    console.log("All enabled options loaded.");
    whattoinsert += ` `;
    whattoinsert += `</div>`;
    console.log(whattoinsert);
    if (wheretoinsert !== null) {
        wheretoinsert.insertAdjacentHTML("beforebegin", whattoinsert);};
});
