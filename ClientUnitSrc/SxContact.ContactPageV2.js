define('ContactPageV2', ["terrasoft",'ContactPageV2Resources', 'GeneralDetails',"MultiMaskEdit","BusinessRuleModule","GridUtilitiesV2"],
function(terrasoft,resources, GeneralDetails,MultiMaskEdit,BusinessRuleModule) {
	return {
		entitySchemaName: 'Contact',
		details: /**SCHEMA_DETAILS*/{
            ContactAddress: {
                schemaName: "ContactAddressDetailV2",
                filter: {
                    masterColumn: "Id",
                    detailColumn: "Contact"
                },
                subscriber: function() {
                    this.typeChanged();
                },
                defaultValues:{ "ContactType": {"masterColumn": "Type"}
                }

            },
            ContactCommunication: {
                /*// name: "ContactCommunication", - можно явно указать name, по умолчанию берется имя объекта настройки детали
                 filter: {masterColumn: "Id", detailColumn: "ContactId"}, // masterColumn необязателен, по умолчанию - "Id"
                 filterMethod: function() {
                 }, // Метод для создания фильтра - при сложной фильтрации
                 defaultValues: {"Number": "50",
                 "Name": "Default11"} // Значения по умолчанию*/
                schemaName: "ContactCommunicationDetail",
                filter: {
                    masterColumn: "Id",
                    detailColumn: "Contact"
                }
            }

        }/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
            {
                "operation": "insert",
                "parentName": "ContactGeneralInfoBlock",
                "propertyName": "items",
                "name": "SxPlatform",
                "values": {
                    "bindTo": "SxPlatform",
                    "layout": {"column": 12,"row": 1,"colSpan": 12}
                    //,"visible": {"bindTo": "getIsBlackOrClient"}
                }
            },
	{
		"operation": "merge",
		"name": "Job",
		"values": {
            "contentType": Terrasoft.ContentType.LOOKUP,
			"layout": {
				"column": 0,
				"row": 0,
				"rowSpan": 1,
				"colSpan": 12
			}
		}
	},
	{
		"operation": "merge",
		"name": "JobTitle",
		"values": {
			"layout": {
				"column": 12,
				"row": 0,
				"rowSpan": 1,
				"colSpan": 12
			}
		}
	},
	{
		"operation": "merge",
		"name": "Department",
		"values": {
			"layout": {
				"column": 0,
				"row": 1,
				"rowSpan": 1,
				"colSpan": 12
			}
		}
	},
            {
                "operation": "merge",
                "name": "CloseButton",
                "parentName": "CombinedModeActionButtonsCardLeftContainer",
                "propertyName": "items",
                "values": {
                    "itemType": Terrasoft.ViewItemType.BUTTON,
                    "caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
                    "click": {"bindTo": "onCardAction"},
                    "visible": {"bindTo": "ShowCloseButton"},
                    "classes": {"textClass": ["actions-button-margin-right"]},
                    "tag": "onCloseClick"
                }
            },
	{
		"operation": "merge",
		"name": "DecisionRole",
		"values": {
			"layout": {
				"column": 12,
				"row": 1,
				"rowSpan": 1,
				"colSpan": 12
			}
		}
	}


]/**SCHEMA_DIFF*/,
		attributes: {
            "Type": {
                dependencies: [
                    {
                        columns: ["Type"],
                        methodName: "typeChanged"
                    }
                ]
            }
        },

		methods: {


           onEntityInitialized: function() {
                this.callParent(arguments);
                this.initTypeAndCountry();
                this.typeChanged();

            },

       /*     getIsBlackOrClient: function(){
                debugger;
                if(TypeStatus == 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd' ||TypeStatus =='00783ef6-f36b-1410-a883-16d83cab0980') {
                    return true;
                }
                else{
                    return false;
                }
            },*/
            initTypeAndCountry:function(){
                if(this.get('Country')!=undefined){
                    CountryBase=this.get('Country').displayValue;
                } else{
                    CountryBase=null;
                }
                if(this.get('Type')!=undefined){
                    TypeStatus=this.get('Type').value;
                } else{
                    TypeStatus=null;
                }
                this.removeAndAddTabs();
            },
            removeAndAddTabs: function(){
                //  this.updateDetail({detail:"ContactAddress", reloadAll: true});
                /*Скрывает и добавляет вкладку Место Работы*/
                var tabsCollection = this.get("TabsCollection");
                if (!tabsCollection.contains("JobTabContainer")) {
                    var tab = Ext.create("Terrasoft.BaseViewModel", {
                        values: {
                            Name: "JobTabContainer",
                            Caption: "Место работы"
                        }
                    });
                    tabsCollection.insert(1,"JobTabContainer",tab);
                }

                if( this.get('Type')!=undefined ){
                    if ( this.get('Type').displayValue == 'Клиент физ.лицо' ||this.get('Type').displayValue == 'Черный список') {
                        tabsCollection.removeByKey("JobTabContainer");
                    }
                }
           //     this.getIsBlackOrClient();

            },
            typeChanged: function() {
                if(typeof TypeStatusOld!= "undefined") {
                    if (this.isEditMode() || this.isCopyMode()) {
                        /*Перерисовывает детали Адрес и Средства связи */
                        this.sandbox.loadModule("DetailModuleV2", {
                            renderTo: "ContactPageV2ContactAddressContainer",
                            id: "SectionModuleV2_ContactSectionV2_CardModuleV2_detail_ContactAddress"
                        });
                        this.sandbox.loadModule("DetailModuleV2", {
                            renderTo: "ContactPageV2ContactCommunicationContainer",
                            id: "SectionModuleV2_ContactSectionV2_CardModuleV2_detail_ContactCommunication"
                        });
                    }
                   // debugger;
                    if (this.isAddMode() && this.get('Type')!=undefined) {
                        /*Перерисовывает детали Адрес и Средства связи */
                        this.sandbox.loadModule("DetailModuleV2", {
                            renderTo: "ContactPageV2ContactAddressContainer",
                            id: "SectionModuleV2_ContactSectionV2_CardModuleV2_chain00000000-0000-0000-0000-000000000000_detail_ContactAddress"
                        });
                        this.sandbox.loadModule("DetailModuleV2", {
                            renderTo: "ContactPageV2ContactCommunicationContainer",
                            id: "SectionModuleV2_ContactSectionV2_CardModuleV2_chain00000000-0000-0000-0000-000000000000_detail_ContactCommunication"
                        });
                    }
                }
                    this.initTypeAndCountry();


            },
            onCloseClick: function() {
                this.onCloseCardButtonClick();
            },

            onCloseCardButtonClick: function() {
                if (this.tryShowNextPrcElCard()) {
                    return;
                }
                if (this.get("IsInChain") || this.get("IsProcessMode") || this.get("IsSeparateMode")) {
                    this.sandbox.publish("BackHistoryState");
                    return;
                }
                this.sandbox.publish("CloseCard", null, [this.sandbox.id]);
                delete TypeStatusOld;
            }

        },
        rules: {

            "SxPlatform": {
                "BindParameterEnabledSxPlatform": {
                    "ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                    "property": BusinessRuleModule.enums.Property.VISIBLE,
                    "conditions": [
                        {
                            "leftExpression": {
                                "type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                 attribute: "Type"
                            },
                            "comparisonType": Terrasoft.ComparisonType.EQUAL,
                            "rightExpression": {
                                "type": BusinessRuleModule.enums.ValueType.CONSTANT,
                                "value": 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd'
                            }
                        },
                        {
                            "leftExpression": {
                                "type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "Type"
                            },
                            "comparisonType": Terrasoft.ComparisonType.EQUAL,
                            "rightExpression": {
                                "type": BusinessRuleModule.enums.ValueType.CONSTANT,
                                "value": '00783ef6-f36b-1410-a883-16d83cab0980'
                            }
                        }
                    ]
                }
            }
        },
		userCode: {}
	};
});
