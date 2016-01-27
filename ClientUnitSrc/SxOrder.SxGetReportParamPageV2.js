define("SxGetReportParamPageV2",["terrasoft","BusinessRuleModule", "ConfigurationConstants","Constants","SxGetReportParamPageV2Resources","LookupUtilities"],
    function(Terrasoft,BusinessRuleModule, ConfigurationConstants,Constants,resources,LookupUtilities){
        return{
            entitySchemaName: "Order",
            details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
            attributes: {
                /**
                 * Виртуальное поле "Контакт".
                 */
                "Owner": {
                    dataValueType: Terrasoft.DataValueType.LOOKUP,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    isRequired: true
                },
                "SxStartDate": {
                    dataValueType: Terrasoft.DataValueType.DATE,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    isRequired: true

                },
                "SxDueDate": {
                    dataValueType: Terrasoft.DataValueType.DATE,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    isRequired: true
                }
            },
            methods: {
                /**
                 * Открывает справочник выбор
                 * @param arg1 Не используется
                 * @param tag Признак
                 */
                loadLookup: function(arg1, tag) {

                    var addCallback = function(args) {
                        var selectedRows = args.selectedRows;
                        if (selectedRows.getCount() > 0) {
                            this.loadLookupDisplayValue("Contact", selectedRows.getByIndex(0).Id);
                        }
                    };
                    var config = { entitySchemaName: tag };
                    LookupUtilities.Open(this.sandbox, config, addCallback, this);
                },

                /**
                 * Возвращает заголовок страницы
                 * @overridden
                 * @return {String}
                 */
                getHeader: function() {
                    return 'Отчет по ЗП'//this.get("Resources.Strings.LeadQualificationPageCaption");
                },

                /**
                 * Событие окончания инициализации сущности
                 * @overridden
                 */
                onEntityInitialized: function() {
                    this.callParent(arguments);
                    this.set("ContactList", this.Ext.create("Terrasoft.Collection"));
                    this.set("SxStartDate",new Date());
                    this.set("SxDueDate",new Date());
                },

                /**
                 * Проверка на наличие данных в полях
                 *  Передает значения для формирования отчета
                 * @overridden
                 */
                save: function() {
                    var Owner=this.get("Contact")||this.get("Owner");
                    var SxStartDate=this.get("SxStartDate");
                    //var SxDueDate=this.get("SxDueDate").addDays(1);
                    var a=new Date(this.get("SxDueDate"));
                    a.setDate(a.getDate()+1);
                    var SxDueDate=a;
                    if (this.Ext.isEmpty(Owner)||
                        this.Ext.isEmpty(SxStartDate)||
                        this.Ext.isEmpty(SxDueDate)) {
                        Terrasoft.showInformation("Не все поля заполнены");
                    } else {

                        var StartDate = SxStartDate.toLocaleDateString();
                        var DueDate= SxDueDate.toLocaleDateString();
                        var OwnerName=Owner.displayValue;
                        var OwnerId=Owner.value;

                        var dataSend = {
                            OwnerId: OwnerId,
                            StartDate: StartDate,
                            DueDate: DueDate
                        };
                        Terrasoft.AjaxProvider.request({
                            url: "../rest/SxSalaryReportService/GetReportURL",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            method: "POST",
                            jsonData: dataSend,
                            callback: function (request, success, response) {
                                var responseObject = {};
                                if (success) {
                                    responseObject = Terrasoft.decode(response.responseText);
                                    var key = "/" + responseObject.GetReportURLResult;
                                    debugger;
                                    var reportCaption = "Отчет по ЗП с" + StartDate + " по " + DueDate + ".xlsx";
                                    var report = document.createElement("a");
                                    report.href = "../rest/SxSalaryReportService/" + "GenerateSalaryReport" + key;
                                    report.download = reportCaption;
                                    document.body.appendChild(report);
                                    report.click();
                                    document.body.removeChild(report);
                                    this.sandbox.publish("BackHistoryState");
                                }
                            }, scope: this
                        });

                    }
                },

                /**
                 * Возврат назад
                 * @private
                 */
                onDiscardChangesClick: function() {
                    this.sandbox.publish("BackHistoryState");
                },

                /**
                 * Заполняет список отправителей письма
                 * @protected
                 */
                loadList: function() {
                    var list = arguments[1];
                    if (list === null) {
                        return;
                    }
                    list.clear();
                    var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
                        rootSchemaName: "Contact"
                    });
                    esq.addColumn("Id");
                    esq.addColumn("Name");

                    esq.getEntityCollection(function(result) {
                        var collection = result.collection;
                        var columns = {};
                        if (collection && collection.collection.length > 0) {
                            Terrasoft.each(collection.collection.items, function(item) {

                                var lookupValue = {
                                    displayValue: item.get("Name"),
                                    value: item.values.Id
                                };
                                if (!list.contains(item.values.Id)) {
                                    columns[item.values.Id] = lookupValue;
                                }
                            }, this);
                            list.loadAll(columns);
                        }
                    }, this);
                }
            },
            diff: /**SCHEMA_DIFF*/[
                {
                    "operation": "merge",
                    "name": "SaveButton",
                    "values": {
                        "caption": 'Сформировать отчет',//{ "bindTo": "Resources.Strings.QualifyButtonCaption" },
                        "visible": true
                    }
                },
                {
                    "operation": "merge",
                    "name": "BackButton",
                    "values": {
                        "visible": true
                    }
                },
                {
                    "operation": "remove",
                    "name": "actions"
                },
                {
                    "operation": "remove",
                    "name": "Tabs"
                },
                {
                    "operation": "insert",
                    "name": "SxGetReportParamPageV2Container",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.CONTAINER,
                        "items": []
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "SxGetReportParamPageV2Container",
                    "name": "SxGetReportParamControlGroup",
                    "propertyName": "items",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.CONTAINER,
                        "items": []
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "SxGetReportParamControlGroup",
                    "propertyName": "items",
                    "name": "SxGetReportParamBlock",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": []
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "SxGetReportParamBlock",
                    "propertyName": "items",
                    "name": "Owner",
                    "values": {
                        "caption":"Ответственный",
                        "controlConfig": {
                            "loadVocabulary": { "bindTo": "loadLookup" },
                            "tag": "Contact",
                            "className": "Terrasoft.LookupEdit",
                            "list": {
                                "bindTo": "ContactList"
                            },
                            "prepareList": {
                                "bindTo": "loadList"
                            }
                        },
                        "layout": { "column": 0, "row": 0, "colSpan": 12 },
                        "isRequired" : true
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "SxGetReportParamBlock",
                    "propertyName": "items",
                    "name": "SxStartDate",
                    "values": {
                        "caption":"С    ",
                        "layout": { "column": 0, "row": 1, "colSpan": 12 },
                        "isRequired":true
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "SxGetReportParamBlock",
                    "propertyName": "items",
                    "name": "SxDueDate",
                    "values": {
                        "caption":"По   ",
                        "layout": { "column": 0, "row": 2, "colSpan": 12 },
                        "isRequired":true
                    }
                }
            ],/**SCHEMA_DIFF*/
            rules: {}
        };
    });