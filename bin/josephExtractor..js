/**
 * Created by claud on 15/12/2017.
 */




var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var path=require('path');
var  dom = require('xmldom').DOMParser

var tagNames=[];

var importJoseph={

    importJoseph: function () {
        //   var pathStr= path.resolve("D:\\rdf\\quran_data_full.owl")
       // var pathStr = path.resolve("./data0772-FondsJosephWresinski-SerieC-Inv.xml")
        var pathStr = path.resolve("D:\\ATD_Baillet\\archives\\0772-FondsJosephWresinski-SerieC-Inv.xml")
        var str = "" + fs.readFileSync(pathStr);

        var doc = new dom().parseFromString(str);


        var allElts = doc.documentElement.getElementsByTagName("*");

        for (var j = 0; j < allElts.length; j++) {
            if (true || allElts[j].attributes && allElts[j].attributes[0] && allElts[j].attributes[0].name == "rdf:about") {
                var tag = allElts[j].tagName;
                if (tagNames.indexOf(tag) < 0) {
                    tagNames.push(tag);
                    console.log("'" + tag + "',");
                }
            }
        }

        var rows = []


        var xmlRows = doc.documentElement.getElementsByTagName("row");
        for (var j = 0; j < xmlRows.length; j++) {
            var aRow = []
            rows.push(aRow)
            var entries = xmlRows[j].getElementsByTagName("entry");

            for (var k = 0; k < entries.length; k++) {
                var entry = entries[k];
                var value =""
                var paras = entry.getElementsByTagName("para");
                for (var i= 0; i < paras.length; i++) {
                    var para = paras[i];
                    if(para && para.firstChild) {
                        if(i>0)
                            value+= " ";
                         value+= para.firstChild.data;
                    }

                }
                aRow.push(value);

            }

        }
       // console.log(JSON.stringify(rows,null,2));
var tableauConcat="";
        var tableaux={};
        var str="";
        var sep=";";

        var nCols=-1;
        for (var i=0;i<rows.length;i++) {

            str += rows[i].length + sep;
            var line=rows[i].length + sep;
            for (var k = 0; k < rows[i].length; k++) {
                var value = rows[i][k];
                value = value.replace(/;/g, ",")
                str += value + sep;
                 line+=value+sep;





            }
            str +="\n"

            if(line.indexOf(";Cote Boite;") >-1) {//début d'un tableau utile
          //  if(line.indexOf(";Cote Boite;Cote Série;") >-1) {//début d'un tableau utile
                nCols=line.substring(0,line.indexOf(sep))
                if (!tableaux[nCols])
                    tableaux[nCols] = "";
                tableaux[nCols] += line+"\n";


            }
                else{
                if(line.indexOf(nCols)==0) {// ligne du tableau si meme nombre de colonnes que l'entete'
                    tableaux[nCols] += line+"\n";
                }
                else{
                    nCols=-1;
                }

            }

        }

        console.log(str);

for( var key in tableaux)
        console.log(tableaux[key]);
    }







}
module.exports = importJoseph;


if (true) {

    importJoseph.importJoseph();
}



