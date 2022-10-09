(()=>{
    Ex = {
        id:"vue",
        cfg:{
            db_url:"https://voice-game-ea25d-default-rtdb.firebaseio.com/",
            db_time:firebase.database.ServerValue.TIMESTAMP,
            storage:"local",
        },
        flag:{
            db_time:null,
            url:{
                get:(row)=>{
                    return new URL(location.href).searchParams.get(row);
                }
            }
            
        },
        func:{
            StorageUpd:()=>{

                if(Ex.flag.local===undefined || Ex.flag.session===undefined)
                {
                    Ex.flag.local = JSON.parse(localStorage[Ex.id]||`{}`);
                    Ex.flag.session = JSON.parse(sessionStorage[Ex.id]||`{}`);

                    Ex.flag.storage = Ex.flag[Ex.cfg.storage];
                }
                else
                {
                    Ex.flag[Ex.cfg.storage] = Ex.flag.storage;

                    localStorage[Ex.id] = JSON.stringify(Ex.flag.local);
                    sessionStorage[Ex.id] = JSON.stringify(Ex.flag.session);
                }
            },
            ClickEvent:(e)=>{

                if(Ex.func[e.target.dataset.event]!==undefined)
                {
                    Ex.func[e.target.dataset.event](e);
                }
            },
            DBTime:(func)=>{

                Ex.DB.ref("DBTIME").set(Ex.cfg.db_time).then(()=>{

                    Ex.DB.ref("DBTIME").once("value",r=>{

                        Ex.flag.db_time = r.val();

                        Ex.flag.day = Ex.func.IOSDate(new Date(Ex.flag.db_time)).split(" ")[0];


                        if( typeof(func)==="function" ) func();
                    });

                });

            },
            Close:(e)=>{
                
                document.querySelectorAll(e.target.dataset.selector).forEach(o=>{
                    o.remove();
                });

            },
            PopWindow:(html,e)=>{

                var div = document.createElement("div");
                div.className = "pop";
                
                
                if(e!==undefined)
                {
                    div.style.left = e.x + window.scrollX + 'px';
                    div.style.top = e.y + window.scrollY +  'px';
                }

                div.innerHTML = html;

                document.body.prepend(div);


                return div;
            },
            IOSDate:(IOSDate,opt = {})=>{

                if(IOSDate===undefined) return opt.msg||``;

                opt.Y = (opt.Y!==undefined)?opt.Y:true;
                opt.M = (opt.M!==undefined)?opt.M:true;
                opt.D = (opt.D!==undefined)?opt.D:true;
                opt.h = (opt.h!==undefined)?opt.h:true;
                opt.m = (opt.m!==undefined)?opt.m:true;
                opt.s = (opt.s!==undefined)?opt.s:true;
                   

                var str = ``;

                str += (opt.Y)?new Date(IOSDate).getFullYear()+'-':'';
                str += (opt.M)?(new Date(IOSDate).getMonth()+1).toString().padStart(2,'0')+'-':'';
                str += (opt.D)?(new Date(IOSDate).getDate()).toString().padStart(2,'0')+' ':'';

                str += (opt.h)?new Date(IOSDate).getHours().toString().padStart(2,'0')+':':'';
                str += (opt.m)?new Date(IOSDate).getMinutes().toString().padStart(2,'0')+':':'';
                str += (opt.s)?new Date(IOSDate).getSeconds().toString().padStart(2,'0'):'';

                return str;
            },
            VoiceRec:(func)=>{

                var record = new webkitSpeechRecognition()

                record.continuous = true;
                record.interimResults = true;
                record.lang = "cmn-Hant-TW";//"ja-JP";
                /*
                record.onresult=function(e){
                    //console.log(e);
                    Object.values(e.results).forEach(r => {
                        
                        console.log(r[0].transcript);
                        if(typeof(func)==="function") func(r);
                    });
                };
                record.onend = ()=>{
                    
                }
                record.start();
                */

                return record;
            },
            RandMove:function(player,max_x,max_y){
                var x = player.x;
                var y = player.y;


                x+=(Math.random()>0.5)?-1:1;
                y+=(Math.random()>0.5)?-1:1;

                if(x>=max_x) x-=2;
                else if(x-1<=0) x+=2;


                if(y>=max_y) y-=2;
                else if(y<0) y+=2;


                player.x = x;
                player.y = y;
            },
            VoiceMove:function(red,voice_word){



                if(Ex.flag.VoiceMoveTime!==undefined)
                if(new Date().getTime() - Ex.flag.VoiceMoveTime<500){

                    return;
                }
                Ex.flag.VoiceMoveTime = new Date().getTime();


                if(voice_word.indexOf("上")!==-1){
                    red.y-=1;
                }

                if(voice_word.indexOf("下")!==-1){
                    red.y+=1;
                }

                if(voice_word.indexOf("右")!==-1){
                    red.x+=1;
                }

                if(voice_word.indexOf("左")!==-1){
                    red.x-=1;
                }

            }

        },
        temp:{
            

            body:()=>{
                return `<div id="Vue">
                
                <Map />


                

                </div>`
            },

            Map:()=>{
                return `<div id="Map" :style="{'width':map_info.width+'px','height':map_info.height+'px'}">
                
                <Grid v-for="(page,key) in map_info.grids" :num="key" :map_info="map_info" :players="players" />
                

                <button @click="move">click</button>

                </div>`
            },


            Grid:()=>{

                return `<div :style="{
                    'width':map_info.grid_size-2+'px',
                    'height':map_info.grid_size-2+'px'}" 
                    :x="x" :y="y">
                
                <div class="player red" :style="{
                    'width':map_info.grid_size-10+'px',
                    'height':map_info.grid_size-10+'px'}" 
                    v-if="x===players.red.x && y===players.red.y">red</div>
                
                <div class="player blue" :style="{
                    'width':map_info.grid_size-10+'px',
                    'height':map_info.grid_size-10+'px'}" v-if="x===players.blue.x && y===players.blue.y">blue</div>

                
                </div>`;
            }



        },
        init:()=>{

            Ex.func.StorageUpd();

            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();

            document.addEventListener("click",Ex.func.ClickEvent);

            Ex.flag.players = Ex.flag.players||{
                red:{
                    x:0,y:0
                },
                blue:{
                    x:9,y:9
                }
            }

            Ex.vue = Vue.createApp({
                template:Ex.temp.body(),
                data(){
                    return{
                        
                    }
                },
                computed:{},
                methods:{}
            });


            Ex.vue.component("Map",{
                name:"Map",
                template:Ex.temp.Map(),
                data(){
                    return{
                        map_info:{
                            grid_size:50,
                            grids:100,
                            height:500,
                            width:500
                        },
                        players:Ex.flag.players,
                        record:Ex.func.VoiceRec()
                    }
                },
                methods:{
                    move:function(){

                        var red = this.players.red
                        var blue = this.players.blue;
                        var max_x = this.map_info.width/this.map_info.grid_size;
                        var max_y = this.map_info.height/this.map_info.grid_size;

                        Ex.func.RandMove(red,max_x,max_y);

                        Ex.func.RandMove(blue,max_x,max_y);


                        if(this.players.red.x===this.players.blue.x && this.players.red.y===this.players.blue.y) 
                        {
                            cancelAnimationFrame(this.timer);
                            return;
                        }

                        this.timer = requestAnimationFrame(this.move);
                    }
                },
                mounted:function(){

                    Ex.DB.ref("red").on("value",r=>{

                        r = r.val();

                        this.players.red.x = r.x;
                        this.players.red.y = r.y;
                    
                    });
                    
                    //this.move();

                    this.record.onresult = (e)=>{
                        console.log(e);
                        
                        var voice_word = e.results[e.results.length-1][0].transcript
                        ;

                        /*
                        Object.values(e.results).forEach(r => {
                            
                            var voice_word = r[0].transcript;
                            

                        });
                        */

                        var red = this.players.red;


                        Ex.func.VoiceMove(red,voice_word);

                        /*
                        if(voice_word.indexOf("上",Ex.flag.voice_word_index)!==-1){
                            Ex.flag.voice_word_index = voice_word.indexOf("上",Ex.flag.voice_word_index)+1;
                            red.y-=1;
                            _move = true;
                        }

                        if(voice_word.indexOf("下",Ex.flag.voice_word_index)!==-1){
                            Ex.flag.voice_word_index = voice_word.indexOf("下",Ex.flag.voice_word_index)+1;
                            red.y+=1;
                            _move = true;
                        }

                        if(voice_word.indexOf("右",Ex.flag.voice_word_index)!==-1){
                            Ex.flag.voice_word_index = voice_word.indexOf("右",Ex.flag.voice_word_index)+1;
                            red.x+=1;
                            _move = true;
                        }

                        if(voice_word.indexOf("左",Ex.flag.voice_word_index)!==-1){
                            Ex.flag.voice_word_index = voice_word.indexOf("左",Ex.flag.voice_word_index)+1;
                            red.x-=1;
                            _move = true;
                        }

                        if(!_move) Ex.flag.voice_word_index = 0;
                        */

                    };

                    this.record.start();

                        
                }
                
            })

            Ex.vue.component("Grid",{
                name:"Grid",
                template:Ex.temp.Grid(),
                props:["num","map_info","players"],
                data(){
                    return{
                        
                    }
                },
                computed:{
                    x:function(){
                        return this.num%10;
                    },
                    y:function(){
                        return Math.floor(this.num/10);                        
                    }
                }
            })


            Ex.vue.mount("body");


            return;


            v = Vue.createApp({
                template:`<div v-bind:id="obj_id">
                <input type="text" v-model="message"><br />

                <input type="text" v-model="x"><br />
                <input type="text" v-model="y"><br />

                <div v-if="if_check" v-show="show_check" v-bind:class="vue_class"  v-html="html">{{obj_id}}</div>

                <input type="button" v-on:click="Js({y:y},$event)" value="btn"><br />

                <a v-for="page in 10">{{page}}&nbsp;</a>

                <component_test :pmsg="obj_id"></component_test>
                
                {{ message }} {{func()}} 好棒棒!</div>`,
                data(){
                    return {
                        html:`<h1>test</h1>`,
                        message: 'Hello Vue!',
                        obj_id:'obj_id',
                        vue_class:'test_class',
                        y:10,
                        if_check:true,
                        show_check:true
                    }
                },
                computed:{
                    x:{
                        get(){
                            return this.y/2;
                        },
                        set(val){
                            this.y = val*2;
                        }
                    }
                },
                methods:{
                    Js:(opt,e)=>{console.log(opt);console.log(e);},
                    func:function(){ return this.message + ':func_str' } 
                }
            });

            v.component("component_test",{
                props: {
                    pmsg:{type:Number}
                },
                template: `<div>
                component_test parentMsg =>  {{pmsg}}
                </div>`,


            });

            
            
            vm = v.mount('body');

        }
    }


    window.onload = ()=>{
        
        Ex.init();
        
    }


   
})();


/*

record = new webkitSpeechRecognition()

record.continuous = true;
record.interimResults = true;
record.lang = "cmn-Hant-TW";//"ja-JP";
record.onresult=function(e){
    Object.values(e.results).forEach(r => {
        
        console.log(r);
    });
};
record.onend = ()=>{
    
}
//record.start();



Ex.flag.SpeechRecord = new webkitSpeechRecognition()

var r = Ex.flag.SpeechRecord;
r.continuous = true;
r.interimResults = true;
r.lang = lang;
r.onresult=function(e){
    Object.values(e.results).forEach(r => {
        Ex.flag.SpeechRecordSec = 0;
        Ex.flag.SpeechRecord_r = r;
        Ex.obj.SpeechRecord.innerHTML = r[0].transcript;
    });
};
r.onend = ()=>{
    //console.log("SpeechRecordend");
    Ex.flag.SpeechRecordSec = 0;

    if(Ex.flag.SpeechRecordStatus)
        setTimeout(()=>{
            r.start();
        },1000);
}
//r.start();


*/