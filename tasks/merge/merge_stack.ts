type Indexed<T = any> = {
    [key: string]: T;
};

function merge(lhs: Indexed, rhs: Indexed): Indexed {

}


const testing = (userFun)=>{
    return JSON.stringify(
    {
        a: {
            b: {
                a: 2,
                c: 1,
            }
        },
        d: 5,
    }) === JSON.stringify(userFun(
    {
        a: {
            b: {
                a: 2
            }
        },
        d: 5
    }, 
    {
        a: {
            b: {
                c: 1
            }
        }
    }));
}




