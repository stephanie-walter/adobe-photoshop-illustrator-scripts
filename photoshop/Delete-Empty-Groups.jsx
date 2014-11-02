// https://forums.adobe.com/thread/1135762
#target Photoshop  
app.bringToFront();  
main();  
function main(){  
if(!documents.length) return;  
//iterate 5 loops incase of nested layersets  
for(var t = 0; t<1;t++){  
var LayerSetLayers=[];  
var lSets = getLayerSets();  
for(var z in lSets){  
var lset = getChildIndex(Number(lSets[z]), true );  
LayerSetLayers[Number(lSets[z])] = lset;  
}  
var emptySets = new Array();  
for(var a in lSets){  
    if(LayerSetLayers[Number(lSets[a])].length <1) emptySets.push(getLayerID(Number(lSets[a])));  
    }  
    for(var g in emptySets){  
      if(selectLayerById(Number(emptySets[g]))) deleteLayer();  
        }  
    }  
};  
function getLayerID(IDX){  
var ref = new ActionReference();  
if(IDX == undefined){  
ref.putEnumerated( charIDToTypeID('Lyr '),charIDToTypeID('Ordn'),charIDToTypeID('Trgt') );   
}else{  
    ref.putIndex( charIDToTypeID('Lyr '), IDX );  
    }  
var desc = executeActionGet(ref);  
return desc.getInteger(stringIDToTypeID( 'layerID' ));  
};  
function selectLayerById(ID, add) {  
    add = (add == undefined)  ? add = false : add;  
 var ref = new ActionReference();  
 ref.putIdentifier(charIDToTypeID('Lyr '), ID);  
 var desc = new ActionDescriptor();  
 desc.putReference(charIDToTypeID('null'), ref);  
 if (add) {  
  desc.putEnumerated(stringIDToTypeID('selectionModifier'), stringIDToTypeID('selectionModifierType'), stringIDToTypeID('addToSelection'));  
 }  
 desc.putBoolean(charIDToTypeID('MkVs'), false);  
    try{  
 executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);  
    return true;  
    }catch(e){return false;}  
}  
function deleteLayer() {  
var desc = new ActionDescriptor();  
var ref = new ActionReference();  
ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );  
desc.putReference( charIDToTypeID('null'), ref );  
try{  
executeAction( charIDToTypeID('Dlt '), desc, DialogModes.NO );  
}catch(e){}  
};  
function getLayerSets(){   
   var ref = new ActionReference();   
   ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );   
   var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL')) +1;   
   var Lsets=[];  
try{  
    activeDocument.backgroundLayer;  
var i = 0; }catch(e){ var i = 1; };  
   for(i;i<count;i++){   
       if(i == 0) continue;  
        ref = new ActionReference();   
        ref.putIndex( charIDToTypeID( 'Lyr ' ), i );  
        var desc = executeActionGet(ref);  
        var layerName = desc.getString(charIDToTypeID( 'Nm  ' ));  
        if(layerName.match(/^<\/Layer group/) ) continue;  
        var layerType = typeIDToStringID(desc.getEnumerationValue( stringIDToTypeID( 'layerSection' )));  
        var isLayerSet =( layerType == 'layerSectionContent') ? false:true;  
        if(isLayerSet) Lsets.push(i);  
   };   
return Lsets;  
};  
function getLayerLayerSectionByIndex( index ) {     
   var ref = new ActionReference();   
   ref.putIndex(charIDToTypeID('Lyr '), index);  
   return typeIDToStringID(executeActionGet(ref).getEnumerationValue(stringIDToTypeID('layerSection')));  
};   
function getLayerNameByIndex( index ) {   
    var ref = new ActionReference();   
    ref.putIndex( charIDToTypeID( 'Lyr ' ), index );  
    return executeActionGet(ref).getString(charIDToTypeID( 'Nm  ' ));  
};  
function skipNestedSets( layerIndex ){  
   var isEnd = false;  
   layerIndex = app.activeDocument.layers[app.activeDocument.layers.length-1].isBackgroundLayer ? layerIndex-2:layerIndex;  
   while(!isEnd){  
      layerIndex--;  
      if( getLayerLayerSectionByIndex( layerIndex ) == 'layerSectionStart' ) layerIndex = skipNestedSets( layerIndex );  
      isEnd = getLayerNameByIndex(layerIndex) == '</Layer group>' ? true:false;  
   }  
   return layerIndex-1;  
};  
function getChildIndex(idx, skipNested ){  
   var layerSetIndex = idx;  
   var isEndOfSet = false;  
   var layerIndexArray = [];  
   while(!isEndOfSet){  
      layerSetIndex--;  
      if( getLayerLayerSectionByIndex( layerSetIndex ) == 'layerSectionStart' && skipNested ){  
         layerSetIndex = skipNestedSets( layerSetIndex );  
      }  
  if(getLayerLayerSectionByIndex( layerSetIndex ) == undefined) break;  
      isEndOfSet = getLayerNameByIndex(layerSetIndex) == '</Layer group>' ? true:false;  
     if(!isEndOfSet ) layerIndexArray.push( layerSetIndex );  
   }  
   return layerIndexArray;  
};  
function selectLayerByIndex(index,add){   
 add = (add == undefined)  ? add = false : add;  
 var ref = new ActionReference();  
    ref.putIndex(charIDToTypeID('Lyr '), index);  
    var desc = new ActionDescriptor();  
    desc.putReference(charIDToTypeID('null'), ref );  
       if(add) desc.putEnumerated( stringIDToTypeID( 'selectionModifier' ), stringIDToTypeID( 'selectionModifierType' ), stringIDToTypeID( 'addToSelection' ) );   
      desc.putBoolean( charIDToTypeID( 'MkVs' ), false );   
   try{  
    executeAction(charIDToTypeID('slct'), desc, DialogModes.NO );  
}catch(e){}  
};  