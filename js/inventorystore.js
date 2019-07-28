define(['item'], function(Item) {
    function fixed(value, length) {
        var buffer = '00000000' + value;
        return buffer.substring(buffer.length - length);
    }

    function getGame(object) {
        return object ? (object.game ? object.game : getGame(object.parent)) : null;
    }

    var InventoryStore = Class.extend({
        init: function(parent, index) {
            this.parent = parent;
            this.index = index;
            this.itemKind = null;
            this.itemName = null;
            this.itemCount = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            this.experience = 0;
            var name = '#dialogInventory' + fixed(this.index, 2);
            this.background = $(name + 'Background');
            this.body = $(name + 'Body');
            this.number = $(name + 'Number');

            this.rescale();
            var self = this;
                        	    
        },
        
        rescale: function() {
            this.scale = this.parent.parent.scale;
            if (this.scale == 1)
            {
		    this.background.css({
			'position': 'absolute',
			'left': '' + (15 + Math.floor(this.index % 6) * 17) + 'px',
			'top': '' + (27 + Math.floor(this.index / 6) * 23) + 'px',
			'width': '16px',
			'height': '16px',
			'background-image': 'url("img/1/storedialogsheet.png")',
			'background-position': '-300px -180px'
		    });
		    this.body.css({
			'position': 'absolute',
			'width': '16px',
			'height': '15px',
			'bottom': '1px',
			'line-height': '16px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': '6px',
			'text-align': 'center',

		    });
		    this.number.css({
		    	'margin-top': '15px',
			'color': '#fff',
			'font-size': '6px',
			'text-align': 'center',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',			
		    });
            }
            else if (this.scale == 2)
            {
		    this.background.css({
			'position': 'absolute',
			'left': '' + (30 + Math.floor(this.index % 6) * 33) + 'px',
			'top': '' + (54 + Math.floor(this.index / 6) * 45) + 'px',
			'width': '32px',
			'height': '32px',
			'background-image': 'url("img/2/storedialogsheet.png")',
			'background-position': '-600px -360px'
		    });
		    this.body.css({
			'position': 'absolute',
			'width': '32px',
			'height': '30px',
			'bottom': '2px',
			'line-height': '32px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': '12px',
			'text-align': 'center',
			
		    });
		    this.number.css({
		    	'margin-top': '30px',
			'color': '#fff',
			'font-size': '12px',
			'text-align': 'center',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
		    });
            }
            else if (this.scale == 3)
            {
		    this.background.css({
			'position': 'absolute',
			'left': '' + (45 + Math.floor(this.index % 6) * 50) + 'px',
			'top': '' + (81 + Math.floor(this.index / 6) * 68) + 'px',
			'width': '48px',
			'height': '48px',
			'background-image': 'url("img/3/storedialogsheet.png")',
			'background-position': '-900px -540px'
		    });
		    this.body.css({
			'position': 'absolute',
			'width': '48px',
			'height': '45px',
			'bottom': '3px',
			'line-height': '48px',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
			'color': 'rgba(255,255,0,1.0)',
			'font-size': '18px',
			'text-align': 'center',
			
		    });
		    this.number.css({
		    	'margin-top': '45px',
			'color': '#fff',
			'font-size': '18px',
			'text-align': 'center',
			'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
		    });		
            }
            if (this.itemKind) {
                this.restore();
            }
        },
        
        getIndex: function() {
            return this.index;
        },
        getItemKind: function() {
            return this.itemKind;
        },
        setItemKind: function(value) {
            if (value==null)
            {
            	    this.itemKind = null;
            	    this.itemName = '';            	    
            }
            else
            {
            	    this.itemKind = value;
            	    this.itemName = ItemTypes.KindData[value].name;
            }
        },
        getItemName: function() {
            return this.itemName;
        },

        getComment: function() {
            var game = getGame(this);
            return Item.getInfoMsgEx(this.itemKind, this.enchantLevel, this.skillKind, this.skillLevel, this.durability, this.durabilityMax);
        },
        
        assign: function(itemKind, itemCount, skillKind, skillLevel, durability, durabilityMax, experience) {
            this.setItemKind(itemKind);
            this.itemCount = itemCount;
            this.skillKind = skillKind;
            this.skillLevel = skillLevel;
            this.itemName = ItemTypes.KindData[itemKind].name;
            this.spriteName = ItemTypes.KindData[itemKind].sprite;
            this.durability = durability;
            this.durabilityMax = durabilityMax;
            this.durabilityPercent = durability/durabilityMax*100;
            this.experience = experience;
            this.restore();
        },
        clear: function() {
            this.setItemKind(null);
            this.itemCount = 0;
            this.skillKind = 0;
            this.skillLevel = 0;
            this.release();
        },
        release: function() {
            this.body.css('background-image', '');
            this.body.html("");
            this.body.attr('title', '');
            this.number.html("");
        },
        restore: function() {
            var itemData = ItemTypes.KindData[this.itemKind];
            this.scale = this.parent.parent.scale;
	    this.body.css({'background-image': "url('img/" + this.scale + "/" + itemData.sprite + "')",
		 'background-position': '-'+(itemData.offset[0]*this.scale*16)+'px -'+(itemData.offset[1]*this.scale*16)+'px'});
            
            	if (ItemTypes.isObject(this.itemKind) || ItemTypes.isCraft(this.itemKind))
            		this.number.html(this.itemCount);
            	else
            	{
            		this.number.html(ItemTypes.getLevelByKind(this.itemKind) +"+"+this.itemCount);
            		this.body.html(this.durabilityPercent.toFixed() + "%");
            	}

            this.body.attr('title', this.getComment());
        }
    });
    return InventoryStore;
});

