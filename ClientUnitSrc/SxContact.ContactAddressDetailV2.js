define("ContactAddressDetailV2", ["ContactAddressDetailResources", "terrasoft", "ViewUtilities", "Contact", "ConfigurationEnums", "ConfigurationConstants","MultiMaskEdit"],
    function(resources, Terrasoft, ViewUtilities, Contact, ConfigurationEnums, ConfigurationConstants,MultiMaskEdit) {
        return {
            entitySchemaName: "ContactAddress",

            attributes: {
                GridSettingsChanged: {dataValueType: Terrasoft.DataValueType.BOOLEAN}
            },
            messages: {
            "UpdateDetail": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.SUBSCRIBE
            }
        },
            methods: {

        //        updateDetail: function(config) {
          //          this.callParent(arguments);
            //        this.onGridDataLoaded();
             //},

                afterLoadGridData: function() {
                    this.callParent(arguments);
                    this.visibleColumnGrid();
                },

      /*          onGridDataLoaded: function(response){
                   var gridData = this.getGridData();
                   var items = gridData.getItems();
                   var loadedObject = {};

                    Terrasoft.each(items, function (item) {

                        if(gridData.events.add!=true) {
                            /*Скрывает и добавляет колонку "Тип адреса" детали "Адрес"*/
                /*            if (TypeStatus == 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd' || TypeStatus == '00783ef6-f36b-1410-a883-16d83cab0980') {
                                gridData.events.add.listeners[0].scope.captionsConfig[0] = {"cols": '1', "name": ""};
                                gridData.events.add.listeners[0].scope.columnsConfig[0] = {"cols": '1'};
                            }
                            else {
                                gridData.events.add.listeners[0].scope.captionsConfig[0] = {"cols": '6', "name": "Тип адреса"};
                                gridData.events.add.listeners[0].scope.columnsConfig[0] = {"cols": '6', "key": [0], "link": 'Object'};
                                gridData.events.add.listeners[0].scope.columnsConfig[0].key[0] = {"name": "Object", "type": "text"};
                                gridData.events.add.listeners[0].scope.columnsConfig[0].key[0].name = {"bindTo": "AddressType"};
                                gridData.events.add.listeners[0].scope.columnsConfig[0].link = {"bindTo": "onAddressTypeLinkClick"};
                            }
                        }
                          var primaryValue = item.get(item.primaryColumnName);
                          loadedObject[primaryValue] = item;

                    }, this);

                    gridData.clear();
                    gridData.loadAll(loadedObject);
                  //  this.getEntityStructure(this.entitySchemaName);
},*/
                visibleColumnGrid: function(){
                    var grid = this.getCurrentGrid();

                    if (TypeStatus == 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd' || TypeStatus == '00783ef6-f36b-1410-a883-16d83cab0980') {
                        grid.captionsConfig[0]={"cols": '1', "name": ""};
                        grid.columnsConfig[0]={"cols": '1'};
                    }
                    else {
                        grid.captionsConfig[0] = {"cols": '6', "name": "Тип адреса"};
                        grid.columnsConfig[0] = {"cols": '6', "key": [0], "link": 'Object'};
                        grid.columnsConfig[0].key[0] = {"name": "Object", "type": "text"};
                        grid.columnsConfig[0].key[0].name = {"bindTo": "AddressType"};
                        grid.columnsConfig[0].link = {"bindTo": "onAddressTypeLinkClick"};
                    }
                      grid.reRender();


                },
                getEntityStructure: function(entitySchemaName) {
                   if (!entitySchemaName) {
                        return this.callParent(arguments);
                    }
                    var entityStructure = this.callParent(arguments);
                    var typeColumnName = (entityStructure.attribute = "AddressType");

                    var addressTypes = this.get("AddressTypes");
                    var sourcePage = entityStructure.pages[0];
                    var pages = [];
                    /*Меняет тип кнопки Добавить, детали "Адрес"*/
                    if(TypeStatus == 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd' || TypeStatus =='00783ef6-f36b-1410-a883-16d83cab0980') {
                        pages.push(Ext.apply({}, {
                            "UId": '4f8b2d67-71d0-45fb-897e-cd4a308a97c0',
                            "caption":this.get("Resources.Strings.AddButtonCaption"),
                            "captionLcz": this.get("Resources.Strings.AddButtonCaption"),
                            typeColumnName: typeColumnName
                        },sourcePage));
                        entityStructure.pages = pages;

                    }
                    else{
                        addressTypes.each(function (addressType) {
                            var caption = addressType.get("Name");
                            pages.push(Ext.apply({}, {
                                "UId": addressType.get("Id"),
                                "caption": caption,
                                "captionLcz": caption,
                                "typeColumnName": typeColumnName
                            }, sourcePage));
                        }, this);
                        entityStructure.pages = pages;
                        entityStructure.entitySchemaUId=Terrasoft.generateGUID();
                    }
                    TypeStatusOld=TypeStatus;
                    return entityStructure;
                }

            },

          diff: /**SCHEMA_DIFF*/[
      ]/**SCHEMA_DIFF*/
        };
    });