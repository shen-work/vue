/*
Ex.flag.game.site.sort((a,b)=>{


    return (a.x-b.x===0)?(a.y-b.y):a.x-b.x


}).forEach(v=>{

    console.log(v.x,v.y,v.player)

});
*/

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
            },
            Delay:{}
            
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
            Delay:(KeyName,time,func)=>{


                if(new Date().getTime() - Ex.flag.Delay[KeyName]<time){

                    if(typeof(func)==="function") func();
                    
                    return false;
                }
                Ex.flag.Delay[KeyName] = new Date().getTime();


                return true;

            },
            VoiceRec:()=>{

                try{

                    var record = new webkitSpeechRecognition();

                }catch(e){

                    alert("該瀏覽器不支援此系統");
                    return;
                }

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
            AI:function(ai_name,player){


                var map_info = Ex.flag.game.map_info;

                var max = {
                    x:map_info.width/map_info.grid_size,
                    y:map_info.height/map_info.grid_size
                }

                
                var command_ary = [
                    //"開",
                    "上",
                    "下",
                    "右",
                    "左"
                ];

          
                if(player.x>=max.x-1) command_ary.splice(command_ary.indexOf("右"),1);
                if(player.y>=max.y-1) command_ary.splice(command_ary.indexOf("下"),1);
                if(player.x<=0) command_ary.splice(command_ary.indexOf("左"),1);
                if(player.y<=0) command_ary.splice(command_ary.indexOf("上"),1);
   


            

                var check;
                command_ary.forEach(c=>{

                    switch (c){

                        case "上":

                            Ex.flag.game.site.forEach(site=>{

                                var _y = player.y;
                                while(_y>=0){

                                    check = true;
                                    if(site.x===player.x && site.y!==_y){
                                        check = false;

                                    }
                                    _y--;
                                }
                            });

                            if(check){
                                command_ary.splice(command_ary.indexOf("上"),1);
                            }


                            
                        break;
                        case "下":
                            
                            Ex.flag.game.site.forEach(site=>{

                                var _y = player.y;
                                while(_y<=max.y-1){

                                    check = true;
                                    if(site.x===player.x && site.y!==_y){
                                        check = false;

                                    }
                                    _y++;
                                }
                            });

                            if(check){
                                command_ary.splice(command_ary.indexOf("下"),1);
                            }


                        break;
                        case "右":
                            
                        
                            Ex.flag.game.site.forEach(site=>{

                                var _x = player.x;
                                while(_x<=max.x-1){

                                    check = true;
                                    if(site.x!==_x && site.y===player.y){
                                        check = false;

                                    }
                                    _x++;
                                }
                            });

                            if(check){
                                command_ary.splice(command_ary.indexOf("右"),1);
                            }

                        break;
                        case "左":
                            
                            Ex.flag.game.site.forEach(site=>{

                                var _x = player.x;
                                while(_x>=0){

                                    check = true;
                                    if(site.x!==_x && site.y===player.y){
                                        check = false;

                                    }
                                    _x--;
                                }
                            });

                            if(check){
                                command_ary.splice(command_ary.indexOf("左"),1);
                            }

                        break;
                    }

                });
                


                if( Ex.func.Delay(`AItime${ai_name}`,5000,()=>{

                    requestAnimationFrame(()=>{
                        Ex.func.AI(ai_name,player);
                    });

                })===false ) return;

                console.log(command_ary);
                

                var command = command_ary.sort(()=>Math.random()-0.5).pop();

                console.log(command);
                Ex.func.VoiceAction(player,command);
                

                requestAnimationFrame(()=>{
                    Ex.func.AI(ai_name,player);
                });
            },
            CheckMove:function(player,set){

                var map_info = Ex.flag.game.map_info;

                var max = {
                    x:map_info.width/map_info.grid_size,
                    y:map_info.height/map_info.grid_size
                }

                var _x = player.x;
                var _y = player.y;

                for(var key in set){
                    player[key] = set[key];
                }

                for(var xy of ["x","y"]){

                    player[xy] = (player[xy]<0)?0:player[xy];
                    player[xy] = (player[xy]>max[xy]-1)?max[xy]-1:player[xy];
                }


                map_info.site.forEach(site=>{

                    if(player.x===site.x && player.y===site.y && site.player!==player.id){

                        player.x = _x;
                        player.y = _y;
                    }

                });
                


            },
            VoiceAction:function(player,voice_word){

                var map_info = Ex.flag.game.map_info;
                


                if( Ex.func.Delay(`VoiceAction${player.id}`,500)===false ) return;




                var DB_path = `${Ex.flag.DB_path}/players/${player.id}`;

                var command_ary = [
                    "開",
                    "上",
                    "下",
                    "右",
                    "左"
                ];
                var command = '';



                var voice_word_ary = [];
                for(var i=0;i<voice_word.length;i++){
                    voice_word_ary.push( voice_word.substr(i,1) );
                }
                voice_word_ary.reverse();

                var x = player.x;
                var y = player.y;

                var max = {
                    x:map_info.width/map_info.grid_size,
                    y:map_info.height/map_info.grid_size
                }


                var check_command_ary = [];
                voice_word_ary.forEach(v=>{
                    command_ary.forEach(v2=>{
                        if(v===v2) check_command_ary.push(v2);
                    });
                })

                if(check_command_ary.length===0) return;



                Ex.flag.command_idx = Ex.flag.command_idx||0;

                if(Ex.flag.command_idx>=check_command_ary.length){
                    Ex.flag.command_idx = 0;
                }

                command = check_command_ary[Ex.flag.command_idx];

                Ex.flag.command_idx++;


                var set_xy = {
                    x:x,
                    y:y
                }
                switch (command){
                    case "開":

                        var site_set_ary = [
                            {x:x-1,y:y},
                            {x:x+1,y:y},
                            {x:x,y:y-1},
                            {x:x,y:y+1}
                        ]
                        
                        site_set_ary.forEach(v=>{

                            if(v.x<0 || v.y<0 || 
                                v.x>max.x-1 || v.y>max.y-1) return;

                            var check_site = true;
                            map_info.site.forEach(site=>{

                                if(site.x===v.x && site.y===v.y) 
                                    check_site = false;

                            })
    
                            if(check_site)
                            Ex.DB.ref(`${Ex.flag.DB_path}/site`).push({
                                x:v.x,
                                y:v.y,
                                player:player.id
                            });
    
                        });

                    break;

                    case "上":
                        set_xy = {
                            x:x,
                            y:y-1
                        }
                    break;

                    case "右":
                        set_xy = {
                            x:x+1,
                            y:y
                        }
                    break;

                    case "下":
                        set_xy = {
                            x:x,
                            y:y+1
                        }
                    break;

                    
                    case "左":
                        set_xy = {
                            x:x-1,
                            y:y
                        }
                    break;
                }


                Ex.func.CheckMove(
                    player,
                    set_xy
                );
                Ex.DB.ref(DB_path).update(player);
                

                

                
                
            }

        },
        temp:{
            

            body:()=>{
                return `<div id="Vue">
                
                <Map />


                

                </div>`
            },

            Map:()=>{
                return `<div id="Map" :style="style">

                
                
                <Grid v-for="(page,key) in map_info.grids" :num="key" :map_info="map_info" :players="players" />
                


                <div id="point" v-html="point"></div>
                <br/>

                <button v-for="btn in word_actions" @click="word_action">{{btn}}</button>
                <br/>

                <button v-for="btn in word_actions2" @click="word_action2">{{btn}}</button>

                </div>`
            },


            Grid:()=>{

                return `<div :style="grid_style" :class="site_class">

                    
                {{x}},{{y}}

                <div :class="'player ' + player" :style="player_style" 
                    v-if="player!==''">{{player}}</div>

                
                </div>`;
            }



        },
        init:()=>{

            Ex.func.StorageUpd();

            Ex.DB = firebase;
            Ex.DB.initializeApp({databaseURL:Ex.cfg.db_url});
            Ex.DB = Ex.DB.database();

            document.addEventListener("click",Ex.func.ClickEvent);

            Ex.flag.game_id = 0;//new Date().getTime();
            Ex.flag.DB_path  =`game/${Ex.flag.game_id}`;

            Ex.DB.ref(Ex.flag.DB_path).once("value",r=>{

                Ex.flag.game = r.val()||{};

                Ex.flag.game.players = Ex.flag.game.players||{};
    
                Ex.flag.game.players.red = Ex.flag.game.players.red||{
                    id:"red",
                    x:0,
                    y:0};
                Ex.flag.game.players.blue = Ex.flag.game.players.blue||{
                    id:"blue",
                    x:9,
                    y:9};
                

                Ex.flag.game.site = Object.values(Ex.flag.game.site||{})||[];



                Object.keys(Ex.flag.game.players).forEach(player=>{


                    var check_site = true;
                    Ex.flag.game.site.forEach(site=>{

                        if(site.x===Ex.flag.game.players[player].x &&
                            site.y===Ex.flag.game.players[player].y &&
                            site.player===player)
                            {
                                check_site = false;
                            }                            
                    });

                    if(check_site)
                    Ex.flag.game.site.push({
        
                        x:Ex.flag.game.players[player].x,
                        y:Ex.flag.game.players[player].y,
                        player:player
                    })
                    

                });

                

                Ex.DB.ref(Ex.flag.DB_path).update(Ex.flag.game);
    
            
            }).then(()=>{

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
                                width:500,
                                site:Ex.flag.game.site
                            },
                            players:Ex.flag.game.players,
                            word_actions:["上","下","右","左","開","右上下右左ABCDEFG開"],
                            word_actions2:["上","下","右","左","開"]
                        }
                    },
                    methods:{
                        word_action:function(e){

                            Ex.func.VoiceAction(
                                this.players.red,
                                e.target.innerHTML);
                        },
                        word_action2:function(e){

                            Ex.func.VoiceAction(
                                this.players.blue,
                                e.target.innerHTML);
                        }
                    },
                    computed:{
                        style:function(){
                            return {
                                width:`${this.map_info.width}px`,
                                height:`${this.map_info.height}px`
                            }
                        },
                        point:function(){

                            var red = 0,blue = 0;

                            this.map_info.site.forEach(v=>{
                            
                                (v.player==="red")?red++:blue++;
                            
                            });

                            return `RED：${red}<br />BLUE：${blue}`;

                        }
                    },
                    created:function(){

                        
                    },
                    mounted:function(){

                        Ex.flag.game.map_info = this.map_info;


                        //Ex.func.AI('blue',this.players.blue);
                        //Ex.func.AI('red',this.players.red);


                        Ex.DB.ref(Ex.flag.DB_path).on("value",r=>{

                            r = r.val();

                            if(r===null){
                                location.reload();
                                return;
                            }


                            Object.keys(r.players).forEach(player=>{

                                var x = r.players[player].x;
                                var y = r.players[player].y;

                                this.players[player].x = x;
                                this.players[player].y = y;
                                

                                var check_site = true;
                                this.map_info.site.forEach(site=>{

                                    if(site.x===x && site.y===y){
                                        check_site = false;
                                    }

                                });

                                if(check_site){
                                    this.map_info.site.push(
                                        {
                                            x:x,
                                            y:y,
                                            player:player
                                        }
                                    )
                                }
                                

                                var check_site = true;
                                Object.keys(r.site).forEach(key=>{

                                    var site = r.site[key];

                                    if(site.x===x && site.y===y){

                                        check_site = false;
                                        
                                    }
                                });

                                
                                if(check_site){

                                    Ex.DB.ref(`${Ex.flag.DB_path}/site`).push({
                                        x:x,
                                        y:y,
                                        player:player
                                    })
                                }



                            });

                            Object.keys(r.site).forEach(key=>{

                                var db = r.site[key];

                                var check_site = true;
                                this.map_info.site.forEach((local,idx)=>{
                                    
                                    if(db.x===local.x && 
                                        db.y===local.y){

                                            if(db.player===local.player){

                                                check_site = false;

                                            }else{
    
                                                this.map_info.site.splice(idx,1);
                                            }
                                            
                                        }
                                });

                                if(check_site){
                                    this.map_info.site.push(
                                        {
                                            x:db.x,
                                            y:db.y,
                                            player:db.player
                                        }
                                    )
                                }
                            });
                            
                        });

                        Ex.flag.voice = Ex.func.VoiceRec();
                        

                        Ex.flag.voice.onend = ()=>{
                            //Ex.flag.voice.start();
                        }
                        

                        Ex.flag.voice.onresult = (e)=>{
                            
                            
                            console.log(e.results);
                            
                            var voice_word = e.results[e.results.length-1][0].transcript;

                            console.log(voice_word);

                            /*
                            Object.values(e.results).forEach(r => {
                                
                                var voice_word = r[0].transcript;

                            });
                            */

                            Ex.func.VoiceAction(
                                this.players.red,
                                voice_word);


                        };

                        //Ex.flag.voice.start();

                            
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
                        grid_style:function(){
                            
                            return {
                                width:`${this.map_info.grid_size-2}px`,
                                height:`${this.map_info.grid_size-2}px`
                            }
                        },
                        player_style:function(){

                            return {
                                width:`${this.map_info.grid_size-10}px`,
                                height:`${this.map_info.grid_size-10}px`
                            }
                        },
                        player(){

                            var _return = '';
                            Object.keys(this.players).forEach(player=>{

                                if(this.players[player].x===this.x && 
                                    this.players[player].y===this.y){

                                        _return = player;
                                    }

                            });

                            return _return;

                        },
                        x:function(){
                            return this.num%10;
                        },
                        y:function(){
                            return Math.floor(this.num/10);                        
                        },
                        site_class:function(){

                            var _return = '';
                            this.map_info.site.forEach(site=>{
                                if(site.x===this.x && site.y===this.y)
                                {
                                    _return = site.player;
                                }
                            })

                            return _return;

                        }
                    }
                })


                Ex.vue.mount("body");

            });
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