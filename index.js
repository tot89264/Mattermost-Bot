const { request } = require('express');
const cheerio = require('cheerio');
const Mattermost = require('node-mattermost');
const parser = new (require('xmldom')).DOMParser;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var xhr = new XMLHttpRequest();
var date = new Date();
var mm = new Mattermost("https://Incoming Webhook url"); //전체 Incoming Webhook url

/**api가져오기 
 * https://www.data.go.kr/data/15043376/openapi.do api참조
*/
var url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson'; /*URL*/
var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'서비스키'; /*Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent(''+getToday()); /**/
queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent(''+getToday()); /**/

/** XML로된 값 불러오기 */
xhr.open('GET', url + queryParams, true);
xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
        var xml = parser.parseFromString(this.responseText, "text/xml");

        var createDt = xml.getElementsByTagName("createDt")[0].childNodes[0].nodeValue;
        var deathCnt = xml.getElementsByTagName("deathCnt")[0].childNodes[0].nodeValue;
        var decideCnt = xml.getElementsByTagName("decideCnt")[0].childNodes[0].nodeValue;
        var seq = xml.getElementsByTagName("seq")[0].childNodes[0].nodeValue;
        
        mattremost_webhook_send(decideCnt, deathCnt);
    }
};

xhr.send('');

/** 날짜 가져오기 */
function getToday() {
    const hour = date.getHours();
    let getDay = date.getDate();
    if(hour < 10) {
        getDay = getDay -1;
    }
    const year = date.getFullYear();
    const month = ("0"+(1+date.getMonth())).slice(-2);
    const day = ("0" + getDay).slice(-2);
    return `${year}${month}${day}`;
}

/** mattremost_webhook 보내기*/
function mattremost_webhook_send(decideCnt, deathCnt) {
    const hour = date.getHours();
    let getDay = date.getDate();
    if(hour < 10) {
        getDay = getDay -1;
    }
    const day = ("0" + getDay).slice(-2);
    mm.send({
        text: 
        '---'+'\n'+
        '#### 코로나 최근 현황'+'\n'+
        ''+'\n'+
        '| 날짜  | 확진자 수 | 사망자 수  |'+'\n'+
        '|:------|:---------|:----------|'+'\n'+
        '| ' + date.getFullYear()+'년'+("0"+(1+date.getMonth())).slice(-2)+'월'+day+'일'+' | '+decideCnt+' | '+deathCnt+' |'+'\n'+
        '###### 코로나 조심 하세요.'+'\n'+
        '---'
        ,
        channel: '',            //channel : '#test'
        username: '',           //username : 'botname'
        icon_emoji: 'taco',     
        unfurl_links: true,
        link_names: 1
    });
}




