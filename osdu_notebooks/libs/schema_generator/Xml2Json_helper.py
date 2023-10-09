import Xml2Json_parser

def parsing():
    with open('./sdb_entities.xml') as f:
        data = f.read()
        xml_object = Xml2Json_parser.Xml2Json(data, 'poststackcubetraceheaders', None)
        
        print(f"---- PARSED ENTITY {xml_object.entity_JSON}")
        
        # print(f"---- RAW ENTITY {xml_object.entity_raw}")
        # print(xml_object.entity.get('Property')[:3])
        

        
        # entityt_prop =  [] 
        # for property in xml_object.entity.get('Property')[:]:
        #     prop_dict = {
        #         'Name':property['@Name'],
        #         'Type':property['@Type'],
        #     }
            
        #     entityt_prop.append(prop_dict)
            
        #     entity_dic = {
        #     'EntityName':xml_object.entity.get('@Name'),
        #     'Property': entityt_prop
        # }
        
        
        
        
        # print(f"""My entity dict: 
        #       {entity_dic}""")
        
        
        
        
    
if __name__ == "__main__":
    parsing()
    