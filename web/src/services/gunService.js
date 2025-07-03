import Gun from 'gun';

// Use a public relay peer for GunDB so P2P chat works across devices and in production
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);

export default gun; 