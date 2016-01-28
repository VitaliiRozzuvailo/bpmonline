define("SxDeliveryAndAddressPage", ["BusinessRuleModule"], function (BusinessRuleModule) {
    return {
        entitySchemaName: "SxAddressDeliveryType",
        details: /**SCHEMA_DETAILS*/{
        }/**SCHEMA_DETAILS*/,
        messages: {
            "UpdateNumberFromDB": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.PUBLISH
            },
            "SetNoNovaPochtaMail": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.PUBLISH
            },
            "SetNovaPochta": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.PUBLISH
            }
        },
        attributes: {
            "SxLinq": {
                dependencies: [
                    {
                        columns: ["SxMail"],
                        methodName: "createLink"
                    }
                ]
            },
            "Country": {
                isRequired: { bindTo: "isCountryRequired" }
            },
            "Address": {
                isRequired: { bindTo: "isAddressRequired" }
            },
            "AddressSuggest": {
                dataValueType: Terrasoft.DataValueType.TEXT,
                type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                value: ""
            },
            "isSuggestNeeded": {
                dataValueType: Terrasoft.DataValueType.BOOLEAN,
                type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                value: true
            },
            "SxIsAddress": {
                dependencies: [{
                    columns: ["SxMail"],
                    methodName: "resetIsAddress"
                }]
            },
            "SxNumOfDepartament": {
                "lookupListConfig": {
                    "filter": function () {
                        debugger
                        var city = !Ext.isEmpty(this.get('City')) ? this.get('City').value : '00000000-0000-0000-0000-000000000000';
                        return Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, 'SxCity', city);
                    }
                }
            },
            "SxAddressOfDepartament": {
                dependencies: [{
                    columns: ["SxNumOfDepartament"],
                    methodName: "refreshAddressOfDepartment"
                }]
            },
            "SxMail": {
                dependencies: [{
                    columns: ["Country"],
                    methodName: "resetMail"
                }]
            }
        },
        rules: {
            "SxStreet": {
                BindParametrVisibileSxSreetBySxIsAddress: {
                    ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                    property: BusinessRuleModule.enums.Property.VISIBLE,
                    conditions: [{
                        leftExpression: {
                            type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                            attribute: "SxIsAddress"
                        },
                        comparisonType: Terrasoft.ComparisonType.EQUAL,
                        rightExpression: {
                            type: BusinessRuleModule.enums.ValueType.CONSTANT,
                            value: true
                        }
                    }]
                }
            },
            "SxBuild": {
                BindParametrVisibileSxSreetBySxIsAddress: {
                    ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                    property: BusinessRuleModule.enums.Property.VISIBLE,
                    conditions: [{
                        leftExpression: {
                            type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                            attribute: "SxIsAddress"
                        },
                        comparisonType: Terrasoft.ComparisonType.EQUAL,
                        rightExpression: {
                            type: BusinessRuleModule.enums.ValueType.CONSTANT,
                            value: true
                        }
                    }]
                }
            },
            "SxFlat": {
                BindParametrVisibileSxSreetBySxIsAddress: {
                    ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                    property: BusinessRuleModule.enums.Property.VISIBLE,
                    conditions: [{
                        leftExpression: {
                            type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                            attribute: "SxIsAddress"
                        },
                        comparisonType: Terrasoft.ComparisonType.EQUAL,
                        rightExpression: {
                            type: BusinessRuleModule.enums.ValueType.CONSTANT,
                            value: true
                        }
                    }]
                }
            }
        },
        methods: {
            refreshAddressOfDepartment: function () {
                debugger;
                if (this.get("SxNumOfDepartament")) {
                    var a = this.get("SxNumOfDepartament");
                    var address = this.get("SxNumOfDepartament").displayValue.split(":");
                    if (address.length > 1) {
                        this.set("SxAddressOfDepartament", address[1]);
                        return;
                    }
                }
                this.set("SxAddressOfDepartament", "");
            },
            resetMail: function () {
                if (this.isCountryUkraine()) return;
                this.set("SxMail", "");
                this.set("SxIsAddress", false);
            },

            resetIsAddress: function () {
                if (this.isNovaPochta()) return;
                this.set("SxIsAddress", false);
            },
            isCountryUkraine: function () {
                var c = this.get("Country") || {};
                return (c.value === "a470b005-e8bb-df11-b00f-001d60e938c6");
            },

            isCountryRussia: function () {
                var c = this.get("Country") || {};
                return (c.value === "a570b005-e8bb-df11-b00f-001d60e938c6");
            },
            /*fieldsGroupForm: function () {
               var c = this.get("Country") || {},
                   at = this.get("AddressType") || {};
               return (c.value === "a470b005-e8bb-df11-b00f-001d60e938c6" &&
                   at.value !== "0af25a5b-2a51-4879-ab2d-238173736d59" &&
                   at.value !== "15ab8ead-1187-4b8d-a393-e757b60e5687");
           },*/

            fieldsGroupForm: function () {
                var at = this.get("AddressType") || {};
                return (this.isCountryUkraine() || this.isCountryRussia());
            },
            isNovaPochta: function () {
                if (!this) return;
                var m = this.get("SxMail") || {};
                var c = this.get("Country") || {};
                //проверка на поле почта, которое равно "НОВАЯ ПОЧТА"
                return ((c && c.value == "a470b005-e8bb-df11-b00f-001d60e938c6")
                    && (m && m.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde"));
            },
            createLink: function () {
                var mail = this.get("SxMail");
                if (mail) {
                    switch (mail.value) {
                        case "ec82cf93-0994-4eb0-82a7-b991c55d5dde":
                            this.set("SxLinq", "http://novaposhta.ua/office/list");
                            break;
                        case "bc085176-2cd3-4869-8b5c-2f396061be6a":
                            this.set("SxLinq", "http://www.intime.ua/representations/");
                            break;
                        case "4755794d-1b20-499a-bccd-bc521d7f8c4c":
                            this.set("SxLinq",
                                "http://www.delivery-auto.com/ru-RU/Representatives/RepresentativesList");
                            break;
                        default:
                            this.set("SxLinq", "")
                    }
                }
            },
            init: function () {
                this.callParent(arguments);
                this.on('change:SxLinq', this.reloadLink);
                /*var scr = document.createElement('script');
                 scr.type = "text/javascript";
                 scr.src = "http://api-maps.yandex.ru/2.1/?lang=ru_RU";
                 document.head.appendChild(scr);*/
                this.on('change:Address', this.refreshControlsState, this);
                this.on('change:Country', this.refreshControlsState, this);
            },
            initAddressList: function () {
                this.adressList = Ext.create("Terrasoft.ListView", {
                    alignEl: Ext.get('SxDeliveryAndAddressPageAddressSuggestContainer_Control')
                });
                this.adressList.on('select', function (el) {
                    var data = el.value.data;
                    if (!data.postal_code) {
                        this.set("Address", el.value.value);
                    } else {
                        Terrasoft.showConfirmation("Выбран адресс:\n" + el.displayValue + "\nс почтовым индексом: " +
                                data.postal_code + "\nСохранить?",
                            function (tag) {
                                this.set("Address", el.displayValue.split(", ").splice(1).join(", "));
                                this.set("Zip", data.postal_code);
                                this.loadLookups(data.city, data.region, data.city_with_type, data.region_with_type);
                            }, ["yes", "no"], this);
                    }
                    this.adressList.hide();
                }, this);
                this.on("destroy", function () {
                    Ext.getBody().removeListener('mousedown', this.onMouseDownCollapse, this);
                    this.adressList.destroy();
                }, this);
                Ext.getBody().on('mousedown', this.onMouseDownCollapse, this);
                Ext.ComponentMgr.all.map.SxDeliveryAndAddressPageAddressSuggestTextEdit.on('keyup', this.suggest, this);
                this.set("AddressListInited", true);
            },
            onEntityInitialized: function () {
                this.callParent(arguments);
                this.initAddressList();
                this.refreshControlsState();
            },
            loadLookups: function (city, region, city_with_type, region_with_type) {
                var bq = Ext.create("Terrasoft.BatchQuery");
                var esq = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "City" });
                esq.addColumn("Id");
                esq.filters.add("NameFilter", this.Terrasoft.createColumnFilterWithParameter(
                    this.Terrasoft.ComparisonType.EQUAL, "Name", city));
                bq.add(esq);

                esq = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "Region" });
                esq.addColumn("Id");
                esq.filters.add("NameFilter", this.Terrasoft.createColumnFilterWithParameter(
                    this.Terrasoft.ComparisonType.EQUAL, "Name", region));
                bq.add(esq);

                bq.execute(function (response) {
                    if (response && response.success) {
                        var cities = response.queryResults[0].rows,
                            regions = cityFounded = response.queryResults[1].rows;
                        if (regions.length > 0) {
                            this.set("Region", { value: regions[0].Id, displayValue: region });
                            this.set("Address", this.get("Address").replace(region_with_type + ", ", ""));
                        }
                        if (cities.length > 0) {
                            this.set("City", { value: cities[0].Id, displayValue: city });
                            this.set("Address", this.get("Address").replace(city_with_type + ", ", ""));
                        }
                        if (cities.length == 0 && regions.length == 0) {
                            Terrasoft.showConfirmation("В справочнике Областей не найдено значение:\n" + region
                                + ".\nВ справочнике Городов не найдено значение:\n" + city
                                + ".\nСоздать указанные значения?",
                                function (tag) {
                                    if (tag == 'cancel') return;
                                    var bq = Ext.create("Terrasoft.BatchQuery");
                                    if (tag == 'both' || tag == 'region') {
                                        var iq = Ext.create('Terrasoft.InsertQuery', { rootSchemaName: 'Region' });
                                        var regionId = Terrasoft.generateGUID();
                                        iq.setParameterValue('Id', regionId, Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Country', this.get('Country').value,
                                            Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Name', region, Terrasoft.DataValueType.TEXT);
                                        bq.add(iq);
                                    }
                                    if (tag == 'both' || tag == 'city') {
                                        var iq = Ext.create('Terrasoft.InsertQuery', { rootSchemaName: 'City' });
                                        var cityId = Terrasoft.generateGUID();
                                        iq.setParameterValue('Id', cityId, Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Country', this.get('Country').value,
                                            Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Region', regionId, Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Name', city, Terrasoft.DataValueType.TEXT);
                                        bq.add(iq);
                                    }
                                    bq.execute(function (response) {
                                        if (response.success) {
                                            if (tag == 'both' || tag == 'region') {
                                                this.set('Region', { value: regionId, displayValue: region });
                                                this.set("Address", this.get("Address").replace(region_with_type + ", ", ""));
                                            }
                                            if (tag == 'both' || tag == 'city') {
                                                this.set('City', { value: cityId, displayValue: city });
                                                this.set("Address", this.get("Address").replace(city_with_type + ", ", ""));
                                            }
                                        }
                                    }, this);
                                }, [
                                    { className: 'Terrasoft.Button', caption: 'Регион и город', returnCode: 'both' },
                                    { className: 'Terrasoft.Button', caption: 'Регион', returnCode: 'region' },
                                    { className: 'Terrasoft.Button', caption: 'Город', returnCode: 'city' },
                                    { className: 'Terrasoft.Button', caption: 'Отмена', returnCode: 'cancel' }
                                ], this);
                        } else if (regions.length == 0) {
                            Terrasoft.showConfirmation("В справочнике Областей не найдено значение:\n" + region
                                    + ".\nСоздать указанное значение?",
                                function (tag) {
                                    if (tag == 'no') return;
                                    var bq = Ext.create("Terrasoft.BatchQuery");
                                    var iq = Ext.create('Terrasoft.InsertQuery', { rootSchemaName: 'Region' });
                                    var regionId = Terrasoft.generateGUID();
                                    iq.setParameterValue('Id', regionId, Terrasoft.DataValueType.GUID);
                                    iq.setParameterValue('Country', this.get('Country').value,
                                        Terrasoft.DataValueType.GUID);
                                    iq.setParameterValue('Name', region, Terrasoft.DataValueType.TEXT);
                                    bq.add(iq);
                                    bq.execute(function (response) {
                                        if (response.success) {
                                            this.set('Region', { value: regionId, displayValue: region });
                                            this.set("Address", this.get("Address").replace(region_with_type + ", ", ""));
                                        }
                                    }, this);
                                }, ["yes", "no"], this);
                        } else if (cities.length == 0) {
                            Terrasoft.showConfirmation("В справочнике Городов не найдено значение:\n" + city
                                    + ".\nСоздать указанное значение?",
                                function (tag) {
                                    if (tag == 'no') return;
                                    var bq = Ext.create("Terrasoft.BatchQuery");
                                    var iq = Ext.create('Terrasoft.InsertQuery', { rootSchemaName: 'City' });
                                    var cityId = Terrasoft.generateGUID();
                                    iq.setParameterValue('Id', cityId, Terrasoft.DataValueType.GUID);
                                    iq.setParameterValue('Country', this.get('Country').value,
                                        Terrasoft.DataValueType.GUID);
                                    iq.setParameterValue('Region', regions[0].Id, Terrasoft.DataValueType.GUID);
                                    iq.setParameterValue('Name', city, Terrasoft.DataValueType.TEXT);
                                    bq.add(iq);
                                    bq.execute(function (response) {
                                        if (response.success) {
                                            this.set('City', { value: cityId, displayValue: city });
                                            this.set("Address", this.get("Address").replace(city_with_type + ", ", ""));
                                        }
                                    }, this);
                                }, ["yes", "no"], this);
                        }
                    }
                }, this);
            },
            suggest: function (el) {
                if (this.isCountryRussia())
                    Ext.Ajax.request({
                        method: 'POST',
                        url: 'https://dadata.ru/api/v1/suggest/address',
                        headers: {
                            'Authorization': 'Token bf69a05b6ce842dcd0cbc159648d19a8c49fdf33',
                            'Content-Type': 'application/json'
                        },
                        jsonData: JSON.stringify({
                            query: this.get('Country').displayValue + ' ' + el.el.getValue()
                        }),
                        success: function (response) {
                            var items = Ext.decode(response.responseText).suggestions;
                            this.adressList.listItems = [];
                            for (var i = 0; i < items.length; i++) {
                                this.adressList.listItems.push({ value: items[i], displayValue: items[i].value });
                            }
                            if (items.length) this.adressList.show();
                            else this.adressList.hide();
                        },
                        scope: this
                    });
            },
            onMouseDownCollapse: function (e) {
                if (this.adressList.visible) {
                    var isInWrap = e.within(Ext.ComponentMgr.all.map.SxDeliveryAndAddressPageAddressSuggestTextEdit.getWrapEl());
                    var listView = this.adressList;
                    var isInList = Ext.isEmpty(listView) || e.within(listView.getWrapEl());
                    if (!isInWrap && !isInList) {
                        this.adressList.hide();
                    }
                }
            },
            onSaved: function () {
                //debugger
                this.sandbox.publish("UpdateNumberFromDB");

                if (this.isNovaPochta())
                    this.sandbox.publish("SetNovaPochta");
                else
                    this.sandbox.publish("SetNoNovaPochtaMail");
                this.callParent(arguments);
            },
            refreshControlsState: function () {
                if (!this.get("Address")) {
                    this.set("isAddressRequired", true);
                }
                var country = this.get("Country") || {};
                this.set("isCountryRequired", !country.value);
                this.set("isAddressEnabled", !!country.value);
                if (this.isCountryRussia()) {
                    var value = (this.get("AddressType") || {}).value !== "588a794c-5808-415a-b9e3-f19326e33fc8";
                    this.set("isSuggestNeeded", value);
                } else {
                    this.set("isSuggestNeeded", false);
                }
            },
            getCityEnabled: function () {
                return !this.isCountryRussia();
            },
            reloadLink: function () {
                var control = Ext.ComponentManager.all.map.SxDeliveryAndAddressPageSxLinqTextEdit;
                if (control) {
                    control.setEnabled(true);
                    control.value = this.get('SxLinq');
                    control.showValueAsLink = true;
                    control.reRender();
                    control.setLinkMode(true);
                    if (control.linkEl) {
                        control.linkEl.dom.href = this.get('SxLinq');
                        control.linkEl.dom.target = '_blank';
                    }
                    control.setLinkMode(true);
                    control.setEnabled(false);
                }
            }
        },
        diff: /**SCHEMA_DIFF*/[
			{
			    "operation": "insert",
			    "parentName": "Header",
			    "propertyName": "items",
			    "name": "AddressType",
			    "values": {
			        enabled: true,
			        "layout": { "column": 0, "row": 0, "colSpan": 12 }
			    }
			},
			{
			    "operation": "insert",
			    "parentName": "Header",
			    "propertyName": "items",
			    "name": "Country",
			    "values": {
			        enabled: true,
			        "layout": { "column": 0, "row": 1, "colSpan": 12 }
			    }
			},
            {
                "operation": "insert",
                "parentName": "Header",
                "propertyName": "items",
                "name": "Address",
                "values": {
                    enabled: true,
                    "layout": { "column": 0, "row": 3, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "parentName": "Header",
                "propertyName": "items",
                "name": "SxPaymentType",
                "values": {
                    enabled: true,
                    "dataValueType": Terrasoft.DataValueType.ENUM,
                    "layout": { "column": 12, "row": 0, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "parentName": "Header",
                "propertyName": "items",
                "name": "Region",
                "values": {
                    enabled: true,
                    "layout": { "column": 12, "row": 1, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "parentName": "Header",
                "propertyName": "items",
                "name": "City",
                "values": {
                    enabled: true,
                    "layout": { "column": 0, "row": 2, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "parentName": "Header",
                "propertyName": "items",
                "name": "Zip",
                "values": {
                    enabled: true,
                    "layout": { "column": 12, "row": 2, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "name": "SxHeader",
                "parentName": "HeaderContainer",
                "propertyName": "items",
                "values": {
                    "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                    "items": []
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader",
                "propertyName": "items",
                "name": "AddressSuggest",
                "values": {
                    "bindTo": "AddressSuggest",
                    "layout": { "column": 0, "row": 0, "colSpan": 24 },
                    "caption": "Подбор адреса",
                    enabled: { "bindTo": "isSuggestNeeded" }
                }
            },
            {
                "operation": "insert",
                "name": "SxHeader2",
                "parentName": "HeaderContainer",
                "propertyName": "items",
                "values": {
                    "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                    "items": []
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxLinq",
                "values": {
                    "bindTo": "SxLinq",
                    "layout": { "column": 12, "row": 0, "colSpan": 12 },
                    "visible": {
                        bindTo: "fieldsGroupForm"
                    },
                    "enabled": false
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxMail",
                "values": {
                    "bindTo": "SxMail",
                    "layout": { "column": 0, "row": 0, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                    "visible": {
                        bindTo: "fieldsGroupForm"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "Header",
                "propertyName": "items",
                "name": "SxDeliveryState",
                "values": {
                    "bindTo": "SxDeliveryState",
                    "layout": { "column": 12, "row": 3, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                    "visible": {
                        bindTo: "isCountryRussia"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxAddressOfDepartament",
                "values": {
                    "bindTo": "SxAddressOfDepartament",
                    "layout": { "column": 12, "row": 1, "colSpan": 12 },
                    "visible": {
                        bindTo: "fieldsGroupForm"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxNumOfDepartament",
                "values": {
                    "bindTo": "SxNumOfDepartament",
                    "layout": { "column": 0, "row": 1, "colSpan": 12 },
                    "visible": {
                        bindTo: "fieldsGroupForm"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxIsAddress",
                "values": {
                    "bindTo": "SxIsAddress",
                    "layout": { "column": 0, "row": 3, "colSpan": 12 },
                    "visible": {
                        bindTo: "isNovaPochta"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxIsRedelivery",
                "values": {
                    "bindTo": "SxIsRedelivery",
                    "layout": { "column": 0, "row": 2, "colSpan": 12 },
                    "visible": {
                        bindTo: "isNovaPochta"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxCountOfPlacesNP",
                "values": {
                    "bindTo": "SxCountOfPlacesNP",
                    "layout": { "column": 12, "row": 2, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                    "visible": {
                        bindTo: "isNovaPochta"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxDeliveryTypeNP",
                "values": {
                    "bindTo": "SxDeliveryTypeNP",
                    "layout": { "column": 12, "row": 3, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                    "visible": {
                        bindTo: "isNovaPochta"
                    }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxStreet",
                "values": {
                    "bindTo": "SxStreet",
                    "layout": { "column": 0, "row": 4, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxBuild",
                "values": {
                    "bindTo": "SxBuild",
                    "layout": { "column": 12, "row": 4, "colSpan": 6 }
                }
            },
            {
                "operation": "insert",
                "parentName": "SxHeader2",
                "propertyName": "items",
                "name": "SxFlat",
                "values": {
                    "bindTo": "SxFlat",
                    "layout": { "column": 18, "row": 4, "colSpan": 6 },
                }
            }
        ]/**SCHEMA_DIFF*/
    };
});