// var Station = require("mongoose").model("Station");
const rp = require('request-promise');
const cheerio = require('cheerio');

/* GET users listing. */
var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': '1'
};
const resultJson = [];

const options = {
    uri: 'http://211.236.110.100/GMBIS/m/page/srchBusArr.do',
    headers:headers,
    method: 'GET',
    qs: {
        'act':'srchBusArr',
        'menuCode': '1_03'
    },
    transform: function (body) {
        return cheerio.load(body);
    }
};
Date.prototype.yyyymmdd = function()
{
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : '0'+mm[0]) + (dd[1] ? dd : '0'+dd[0]);
};
Date.prototype.nyyyymmdd = function()
{
    this.setDate(this.getDate() + 1);
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : '0'+mm[0]) + (dd[1] ? dd : '0'+dd[0]);
};


const sikdangOptions = {
    headers:headers,
    qs: {
        ilja: new Date().yyyymmdd()
    },
    transform: function (body) {
        //console.log(body);
        return cheerio.load(body);
    }
};
const sikdangnOptions = {
    headers:headers,
    qs: {
        ilja: new Date().nyyyymmdd()
    },
    transform: function (body) {
        //console.log(body);
        return cheerio.load(body);
    }
};
function getPostion(pos, orders){
    switch (pos)
    {
        //학교, 옥계, 인동에서 구미역 가는거
        case 0:
            switch (orders){
                case 0:
                    return '132';
                case 1:
                    return '3';
                case 2:
                    return '708';
            }
            break;
        //구미역, 옥계중앞, 인동버스정류장 에서 학교 가는거
        case 1:
            //STOP_ID:['80', '10626', '708'];
            switch (orders){
                case 0:
                    return '80';
                case 1:
                    return '626';
                case 2:
                    return '708';
            }
            break;
        //구미역, 학교, 옥계 에서 인동 가는거
        case 2:
            //STOP_ID:['80', '132', '3'];
            switch (orders){
                case 0:
                    return '80';
                case 1:
                    return '132';
                case 2:
                    return '3';
            }
            break;
        // 구미역에서 학교에서 인동에서 옥계 가는거
        case 3:
            //STOP_ID:['80', '132', '709'];
            switch (orders){
                case 0:
                    return '80';
                case 1:
                    return '132';
                case 2:
                    return '709';
            }
            break;
    }
}
function update(pos, orders){
    this.qs.stopId = getPostion(pos, orders);
}
function updateName(){
    this.forEach(function(t){
        switch (t.bus_station){
            case '80':
                t.station_name = '구미역';
                break;
            case '132':
                t.station_name = '금오공대종점';
                break;
            case '709':
                t.station_name = '인동정류장(인동중학교방면)';
                break;
            case '708':
                t.station_name = '인동정류장(인동사거리방면)';
                break;
            case '626':
                t.station_name = '옥계중학교앞';
                break;
            case '3':
                t.station_name = '4공단입구건너(구포동방면)';
                break;
        }
    })
}
function updateSikdang(pos){
    switch (pos){
        case 0:
            //학생식당
            this.uri = 'http://www.kumoh.ac.kr/jsp/common/sikdang.do';
            break;
        case 1:
            //교직원식당
            this.uri = 'http://www.kumoh.ac.kr/jsp/common/sikdang2.do';
            break;
        case 2:
            //기숙사
            this.uri = 'http://dorm.kumoh.ac.kr/facility/dorm/sikdang.do';
            break;
    }
}
exports.businfo = function (req, res, next) {
    const tempPos = Number(req.params.pos);
    update.call(options, tempPos, 0);
    var rp1 = rp(options)
        .then(function ($) {
            const jsonObject = {};
            const jsonArray = [];
            jsonObject.bus_station = getPostion(tempPos, 0);
            $('.arrive_desc').each(function (i, elem) {
                jsonArray.push({});
                jsonArray[i].bus_no = $(this).find('.bus_no').text();
                jsonArray[i].time = $(this).find('.bus_state').text();
                jsonArray[i].location = $(this).find('.bus_state').next().next().text().trim();
            });
            jsonObject.arrive_desc = jsonArray;
            resultJson[0] = jsonObject;
        })
        .catch(function (err) {}
    );
    update.call(options, tempPos, 1);
    var rp2 = rp(options)
        .then(function ($) {
            const jsonObject = {};
            const jsonArray = [];
            jsonObject.bus_station = getPostion(tempPos, 1);
            $('.arrive_desc').each(function (i, elem) {
                jsonArray.push({});
                jsonArray[i].bus_no = $(this).find('.bus_no').text();
                jsonArray[i].time = $(this).find('.bus_state').text();
                jsonArray[i].location = $(this).find('.bus_state').next().next().text().trim();
            });
            jsonObject.arrive_desc = jsonArray;
            resultJson[1] = jsonObject;
        })
        .catch(function (err) {}
        );
    update.call(options, tempPos, 2 );
    var rp3 = rp(options)
        .then(function ($) {
            const jsonObject = {};
            const jsonArray = [];
            jsonObject.bus_station = getPostion(tempPos, 2);
            $('.arrive_desc').each(function (i, elem) {
                jsonArray.push({});
                jsonArray[i].bus_no = $(this).find('.bus_no').text();
                jsonArray[i].time = $(this).find('.bus_state').text();
                jsonArray[i].location = $(this).find('.bus_state').next().next().text().trim();
            });
            jsonObject.arrive_desc = jsonArray;
            resultJson[2] = jsonObject;
        })
        .catch(function (err) {}
        );
    Promise.all([rp1, rp2, rp3]).then( function() {
        updateName.call(resultJson);
        res.status(200).send(resultJson);
    });
};

exports.sikdanginfo = function(req, res, next) {
    const tempPos = Number(req.params.pos);
    updateSikdang.call(sikdangOptions, tempPos);
    updateSikdang.call(sikdangnOptions, tempPos);
    var rp1 = rp(sikdangOptions)
        .then(function ($) {
            if(tempPos === 2)  {
                //푸름
                const jsonObject = {};
                var jsonArray = [];
                $('.meal01').each(function (i, elem) {
                    $(this).find('dd').each(function (ii, ee) {
                        jsonArray.push($(this).text().trim());
                    });
                });
                jsonObject.푸름 = jsonArray;
                resultJson[0] = jsonObject;
                //오름 1동
                jsonArray = [];
                $('.meal02').each(function (i, elem) {
                    $(this).find('dd').each(function (ii, ee) {
                        jsonArray.push($(this).text().trim());
                    });
                });
                jsonObject.오1 = jsonArray;
                resultJson[0] = jsonObject;
                //오름 3동
                jsonArray = [];
                $('.meal03').each(function (i, elem) {
                    $(this).find('dd').each(function (ii, ee) {
                        jsonArray.push($(this).text().trim());
                    });
                });
                jsonObject.오3 = jsonArray;
                resultJson[0] = jsonObject;
            }
            else
            {

            }
        })
        .catch(function (err) {});

    var rp2 = rp(sikdangnOptions)
        .then(function ($) {
            if(tempPos === 2)  {
                //푸름
                const jsonObject = {};
                var jsonArray = [];
                $('.meal01').each(function (i, elem) {
                    $(this).find('dd').each(function (ii, ee) {
                        jsonArray.push($(this).text().trim());
                    });
                });
                jsonObject.푸름 = jsonArray;
                resultJson[1] = jsonObject;
                //오름 1동
                jsonArray = [];
                $('.meal02').each(function (i, elem) {
                    $(this).find('dd').each(function (ii, ee) {
                        jsonArray.push($(this).text().trim());
                    });
                });
                jsonObject.오1 = jsonArray;
                resultJson[1] = jsonObject;
                //오름 3동
                jsonArray = [];
                $('.meal03').each(function (i, elem) {
                    $(this).find('dd').each(function (ii, ee) {
                        jsonArray.push($(this).text());
                    });
                });
                jsonObject.오3 = jsonArray;
                resultJson[1] = jsonObject;
            }
            else
            {

            }
        })
        .catch(function (err) {});
    Promise.all([rp1, rp2]).then( function() {
        res.status(200).send(resultJson);
    });
};


/*
exports.readAll = function(req, res, next) {
    Station.find(function(err, Stations) {
        if(err) {
            res.status(400);
            return next(err);
        } else {
            res.status(200).json(Stations);
        }
    });
};

exports.read = function(req, res, next) {
    Station.findOne({STOP_SERVICEID: req.params.service_id},function(err, Station) {
        if(err) return res.status(500).json({error: err});
        if(!Station) return res.status(404).json({error: 'Station not found'});
        res.json(Station);
    });
};

*/
