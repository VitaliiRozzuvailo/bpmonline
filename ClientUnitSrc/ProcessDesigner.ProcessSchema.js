define('ProcessSchema', ['ext-base', 'terrasoft', 'ProcessSchemaResources',
    'FlowElement'],
    function(Ext, Terrasoft, resources, FlowElement) {
        function Property(name, getDefValue) {
            this.name = name;
            this.getDefValue = getDefValue;
        }
        function getProperties() {
            var properties = [];
            var property;
            property = new Property('uid', function() {return Terrasoft.generateGUID(); });
            properties.push(property);
            property = new Property('name', function() {return 'ProcessSchema1'; });
            properties.push(property);
            property = new Property('caption', function() {return 'ProcessSchema1'; });
            properties.push(property);
            property = new Property('isEnabled', function() {return true; });
            properties.push(property);
            property = new Property('packageUId', function() {return '6F46362B-0D60-47D7-B211-FC5E4117AECB'; });
            properties.push(property);
            property = new Property('flowElements', function() {return []; });
            properties.push(property);
            return properties;
        }
        function ProcessSchema() {
            this.createSchema =
            this.values = {};
            this.methods =  {
                loadProcessSchema: function(shemaUId, callback) {
                    this.runServiceMethod(this, 'LoadProcessSchema',
                        {
							schemaUId: shemaUId
                        },
                        callback);
                },
                save: function() {
                    this.runServiceMethod(this, 'SaveProcessSchema',
                        {
                            schema: Ext.JSON.encode(this.values),
                            shouldBePublished: false
                        });
                },
                publish: function() {
                    this.runServiceMethod(this, 'SaveProcessSchema',
                        {
                            clientProcessSchema: Ext.JSON.encode(this.values),
                            shouldBePublished: true
                        });
                },
                runServiceMethod: function(scope, methodName, data, callback) {
                    Terrasoft.AjaxProvider.request({
                        url: '../ServiceModel/ProcessEngineService.svc/' + methodName,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        scope: scope,
                        jsonData: data,
                        callback: callback
                    });
                },
                onAddedFlowElement: function(args) {
                    this.values.flowElements.push(new FlowElement(args));
                }
            };
        }
        ProcessSchema.createSchema = function() {
            var schema = new ProcessSchema();
            var properties = getProperties();
            for(idx in properties) {
                var property = properties[idx];
                schema.values[property.name] = property.getDefValue();
            }
            return schema;
        }
        return ProcessSchema;
    });
