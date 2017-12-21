var fs = require('fs');
var xml2js = require('xml2js');
var jsonxml = require('jsontoxml');

var parser = new xml2js.Parser();


var extractor = {


    extract: function (inputFile, callback) {


        fs.readFile(inputFile, function (err, data) {
            if (err) {
                if (callback)
                    return callback(err);
            }


            var text = "" + data;

            text = text.replace(/\r\n{1,*}/g, '\n');


            /*     var reglines = /\n/gm
             var lines = [];
             var array = [];
             while ((array = reglines.exec(text)) != null) {
             lines.push(array.index + 1);

             console.log(text.substring(array.index, array.index + 10))
             }


             function setLines(array) {
             for (var i = 0; i < array.length; i++) {
             var index = array[i].index;
             for (var j = 0; j < lines.length; j++) {
             if (index <= lines[j]) {
             array[i].line = j;
             break;
             }
             }
             }
             }*/


            var regBoite = /^(BOITE*.*)/gmi
            var boites = [];
            var array = [];
            while ((array = regBoite.exec(text)) != null) {
                boites.push({name: array[1], start: array.index, groups: []});
            }


            /*    var regItems = /^-(.*)/gmi
             var items = [];
             var array = [];
             while ((array = regItems.exec(text)) != null) {
             items.push({name: array[1], start: array.index});
             }

             var regGroups = / (.*):(.*)/gmi
             var groups = [];
             var array = [];
             while ((array = regGroups.exec(text)) != null) {
             groups.push({name: array[1], start: array.index, items: []});
             }*/


            for (var i = 0; i < boites.length; i++) {
                if (i < boites.length - 1)
                    boites[i].end = boites[i + 1].start
                else
                    boites[i].end = text.length

                var contentBoite = text.substring(boites[i].start + boites[i].name.length, boites[i].end);

                var regGroups = /(^[\d]+.*:+.*$)/gm

                var array = [];
                while ((array = regGroups.exec(contentBoite)) != null) {
                    var group = {name: array[1], start: array.index, items: [], date: "", text: ""};
                    var split = group.name.split(":");
                    if (split.length > 0)
                        group.date = split[0]
                    for (var k = 1; k < split.length; k++) {
                        group.text += split[k]
                    }
                    boites[i].groups.push(group);

                }
                var groups = boites[i].groups;
                for (var j = 0; j < groups.length; j++) {
                    if (j < groups.length - 1)
                        groups[j].end = groups[j + 1].start
                    else
                        groups[j].end = contentBoite.length
                    var contentGroup = text.substring(groups[j].start + groups[j].name.length, groups[j].end);

                    var regItems = /^-(.*)$/gmi
                    var items = [];
                    var array = [];
                    while ((array = regItems.exec(contentGroup)) != null) {
                        var item = array[1]
                        boites[i].groups[j].items.push(item);
                    }



                }


            }


            extractor.boitesToCsv(boites,inputFile+".csv")
            return;




         /*   setLines(boites);
            setLines(groups);
            setLines(items);*/


            for (var i = 0; i < items.length; i++) {
                var itemLine = items[i].line;
                for (var j = 0; j < groups.length; j++) {
                    var groupLine = groups[j].line;
                    if (groupLine >= itemLine) {
                        groups[j].items.push(items[i])
                        break;
                    }
                }

            }

            for (var i = 0; i < groups.length; i++) {
                var groupLine = groups[i].line;
                for (var j = 0; j < boites.length; j++) {
                    var boiteLine = boites[j].line;
                    if ( boiteLine>= groupLine) {
                        boites[j].groups.push(groups[i])
                        break;
                    }
                }

            }





            var p = boites[0].index + boites[0].name.length
            for (var i = 1; i < boites.length; i++) {
                var q = boites[i].index;
                var str = text.substring(p, q);
                var p = q + 1;
                var regGroup = /(.*):(.*)/g

                boites[i].groups = [];
                while ((array = regGroup.exec(str)) != null) {


                    boites[i].groups.push({
                        date: array[1],
                        name: array[2],
                        startIndex: array.index,
                        endIndex: array.index + array[0].length,
                        items: []
                    });
                }
            }


            for (var i = 0; i < boites.length; i++) {
                if (!boites[i].groups)
                    continue;
                var p = boites[i].groups[0].endIndex
                for (var j = 1; j < boites[i].groups.length; j++) {

                    var q = boites[i].groups[j].endIndex;
                    var str = text.substring(p, q);
                    p = q;


                    var regItem = /^-(.*)/gm
                    var items = [];
                    var array2 = []
                    while ((array2 = regItem.exec(str)) != null) {
                        boites[i].groups[j].items.push(array2[1]);
                    }

                }
            }


            extractor.boitesToCsv(boites, inputFile + ".csv", 0, "ANSI");


        })


    },

    removeHtmlTags: function (str) {
        str = str.replace(/<\/p>/gi, "");
        str = str.replace(/<BR>/gi, "");
        str = str.replace(/<[^>]*>/gi, "");

        str = str.replace(/ {2,}/gi, " ");
        str = str.replace(/ /gi, " ");
        str = str.replace(/ /gi, " ")

        return str;
    },

    boitesToCsv: function (boites, path) {
        function cleanStr(str) {

                return str.replace(/;/g, ",").replace(/ [\n\t]*/g, " ").trim();

        }

        var str = "boite;date;titre;item\n";
        var lines = 0;
        for (var i = 0; i < boites.length; i++) {
        try{
            var str0 = cleanStr(boites[i].name) + ";"
            if (boites[i].groups.length==0) {
                str += str0 += "\n"
                console.log(str2)
                continue
            }
            for (var j = 0; j < boites[i].groups.length; j++) {

                var str1 = cleanStr(boites[i].groups[j].date) + ";"
                str1 += cleanStr(boites[i].groups[j].text) + ";"
                if (boites[i].groups[j].items.length==0) {

                    str += str0 + str1 + "\n";
                    lines++;
                    // console.log(str2)
                    continue;
                }
                for (var k = 0; k < boites[i].groups[j].items.length; k++) {
                    var str2 = str0 + str1 + cleanStr(boites[i].groups[j].items[k]);
                    str += str2 + "\n";
                    lines++;
                    // console.log(str2)
                }
            }
        }
        catch(e){
            var xx=1;
        }

        }
        fs.writeFileSync(path, str);
        console.log("done : line " + lines);
    }

}


var test=1;


if(test==0) {
    var file = "./data/europe.txt"
    var data = "" + fs.readFileSync(file);
    var data = data.replace(/\t{1,}/gm, '\t');
    fs.writeFileSync(file + "2", data);

}


if(test==1) {
    var file = "./data/content.xml"
    var file = "./data/test1.txt"
    extractor.extract(file, function (err, result) {
        var body = result["office:document-content"];
        body = body["office:body"][0];
        var text = body["office:text"][0];
        var table = text["table:table"];

    })
}


module.exports = extractor;