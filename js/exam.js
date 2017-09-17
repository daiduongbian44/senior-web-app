
const SIZE_MARK = 26;
const NO_DATA = -1;
const CHAR_MARK = "a";
const SPECIAL_CHARS = ["@", "'"," ", ".", ",","/",":",";","?","[","]","{","}","\\", "_", "-","+","=","!","$", "%", "^","&", "*", "(", ")"];
const MAX_ITEMS_VIEW = 10;

class TrieNode {
    constructor() {
        this.children = new Array(SIZE_MARK);
        this.isLeaf = false;
        this.indexData = NO_DATA;
    }
}

class StringUtil {

    static nomalizeString(str) {
        if (str != undefined && typeof str === 'string') {
            var newStr = str.toLowerCase();
            for(var i = 0; i < SPECIAL_CHARS.length; ++i) {
                newStr = newStr.replace(SPECIAL_CHARS[i], "");
            }
            return newStr;
        }
        return undefined;
    }

    static getIndexOfChar(ch) {
        return ch - CHAR_MARK.charCodeAt(0);
    }

}

class Trie {
    constructor() {
        this.head = new TrieNode();
    }

    insert(key, indexData) {
        var nomalizedStr = StringUtil.nomalizeString(key);
        var lengthKey = nomalizedStr.length;
        var nodeTravel = this.head;

        console.log("Insert: " + nomalizedStr);

        for (var index = 0; index < lengthKey; ++index) {
            var keyIndexChar = StringUtil.getIndexOfChar(nomalizedStr.charCodeAt(index));
            if (nodeTravel.children[keyIndexChar] == undefined || nodeTravel.children[keyIndexChar] == null) {
                nodeTravel.children[keyIndexChar] = new TrieNode();
            }

            nodeTravel = nodeTravel.children[keyIndexChar];
        }

        nodeTravel.isLeaf = true;
        nodeTravel.indexData = indexData;
    }

    searchNodeTravelForKey(nomalizedStr, lengthKey) {
        var nodeTravel = this.head;
        
        for (var index = 0; index < lengthKey; ++index) {
            var keyIndexChar = StringUtil.getIndexOfChar(nomalizedStr.charCodeAt(index));
            if (nodeTravel.children[keyIndexChar] == undefined || nodeTravel.children[keyIndexChar] == null) {
                return null;
            }

            nodeTravel = nodeTravel.children[keyIndexChar];
        }
        return nodeTravel;
    }

    search(key, callback) {
        var nomalizedStr = StringUtil.nomalizeString(key);
        var lengthKey = nomalizedStr.length;
        var nodeTravel = this.searchNodeTravelForKey(nomalizedStr, lengthKey);

        var iRes = nodeTravel != null && nodeTravel != undefined && nodeTravel.isLeaf == true;
        if(iRes == true && callback != null && callback != undefined) {
            callback(nodeTravel.indexData);
        }
        return iRes;
    }

    searchSuggestions(key, callbackFoundWord, callbackSuggestion) {
        var nomalizedStr = StringUtil.nomalizeString(key);
        var lengthKey = nomalizedStr.length;
        var nodeTravel = this.searchNodeTravelForKey(nomalizedStr, lengthKey);

        var iRes = nodeTravel != null && nodeTravel != undefined;
        if(iRes == true && callbackFoundWord != null && callbackFoundWord != undefined && nodeTravel.isLeaf == true) {
            callbackFoundWord(nodeTravel.indexData);
        }
        
        if(nodeTravel != null && nodeTravel != undefined && callbackSuggestion != null && callbackSuggestion != undefined) {
            var listSuggessionIdxs = [];
            this.travelNode(nodeTravel, listSuggessionIdxs);
            callbackSuggestion(listSuggessionIdxs);
        }
        return iRes;
    }

    travelNode(node, listIdxData) {
        if(node == null || node == undefined) {
            return;
        }
        if(node.isLeaf == true) {
            listIdxData.push(node.indexData);
        }

        for(var i = 0; i < node.children.length; ++i) {
            this.travelNode(node.children[i], listIdxData);
        }
    }
}

var trie = new Trie();
var items = TABLE_DATA;

for(var i = 0; i < items.length; ++i) {
    trie.insert(items[i].name, i);
}

console.log(trie.searchSuggestions("Linked-in", function(idx) {
    console.log("index: " + idx)
}, function(listItems){
    console.log("list suggession: " + listItems)
}));

console.log(trie.searchSuggestions("lin", function(idx) {
    console.log("index: " + idx)
}, function(listItems){
    console.log("list suggession: " + listItems);
    
}));

$(document).ready(function () {

    var inputService = $("#input-service-name");
    var listItems = [];
    var currentSelected;

    function searchProcessing(data) {
        var hasRes = false;
        listItems = [];

        if (data != null && data.trim() !== "") {
            hasRes = trie.searchSuggestions(data, function (idx) {
                console.log("index: " + idx)
            }, function (listItemIdxs) {
                console.log("list suggession: " + listItemIdxs);

                for (var i = 0; i < listItemIdxs.length; ++i) {
                    listItems.push(TABLE_DATA[listItemIdxs[i]]);
                }
            });
        }

        if(hasRes == false) {
            for(var i = 0; i < MAX_ITEMS_VIEW && i < TABLE_DATA.length; ++i) {
                listItems.push(TABLE_DATA[i]);
            }
        }

        $("#ul-view-suggession").html("");
        currentSelected = null;

        var textDom = "";
        listItems.forEach(function(item, idx){
            textDom += "<li class='item-suggest' data-item='" + idx + "'><div>" + "<img src='./" + item.thumbnailUrl + "' /><p>" + item.name + "</p></div></li>";
        });
        $("#ul-view-suggession").append(textDom);

        setTimeout(function(){
            $(".item-suggest").on("click", function(){
                if(currentSelected != null) {
                    currentSelected.removeClass("selected");
                }

                currentSelected = $(this);
                console.log('Item click' + $(this).data("item"));
                $(this).addClass("selected");
                inputService.val(listItems[parseInt($(this).data("item"))].name);
                $("#popup").hide();
            });
        }, 100)
    }

    inputService.on("focus", function () {
        console.log("Focus");
        console.log("data: " + $(this).val());
        searchProcessing("");
    });

    inputService.on("click", function () {
        console.log("Click");
        $("#popup").show();
    });

    inputService.on("input", function () {
        console.log("Input");
        console.log("data: " + $(this).val());
        searchProcessing($(this).val());
    });

    inputService.focus();
});