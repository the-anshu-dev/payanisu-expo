import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_TASK_DEFINDER='fetch_user_lacation';
const MINIMUM_INTERVAL=15;

export const initializeBackgroundTask= async(innerMountedPromise)=>{

    TaskManager.defineTask(BACKGROUND_TASK_DEFINDER, async()=>{
        console.log("BG Task started.......");

        await innerMountedPromise
        try {

            const apiRes= await fetch('https://zenquotes.io/app/random')
            const data= await apiRes.json();
            if(data){
                console.log('My data ==>',data)
            }
            
        } catch (error) {
            
            console.log("Error Fetching BG Task.......", error);
        }
        console.log("BG Task done.......");

    });

    if(!(await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_DEFINDER))){
        await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_DEFINDER,{
            minimumInterval: MINIMUM_INTERVAL,
            taskType: BackgroundTask.TaskType.Background,   
        })
    }
}