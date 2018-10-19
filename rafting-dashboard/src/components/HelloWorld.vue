<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <input v-model="peerAddress" title="peer address"/>
    <button v-on:click="addPeer()">Add peer</button>

    <div v-for="peer in peers" :key="peer.address">
        <p class="peers">{{peer.address}}</p>
        <button class="peers" v-on:click="deletePeer(peer)">X</button>
        <table v-if="states[peer.address]">
          <tr>
            <td>Node ID: </td>
            <td>{{ states[peer.address].nodeId}}</td>
          </tr>
          <tr>
            <td>Role: </td>
            <td>{{ states[peer.address].role}}</td>
          </tr>
          <tr>
            <td>Current Term: </td>
            <td>{{ states[peer.address].currentTerm }}</td>
          </tr>
          <tr>
            <td>Last heartbeat: </td>
            <td>{{ states[peer.address].lastHeartbeat }}</td>
          </tr>
          <tr>
            <td>Peers: </td>
            <td>{{ states[peer.address].peers}}</td>
          </tr>
          <tr>
            <td>Voted for: </td>
            <td>{{ states[peer.address].votedFor}}</td>
          </tr>
          <tr>
            <td>Votes granted: </td>
            <td>{{ states[peer.address].votesGranted}}</td>
          </tr>
        </table>
        <p v-else>No data yet</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Rafting Dashboard',
      peerAddress: '',
      peers: [
        {
          id: 123,
          address: '172.18.200.240:5000'
        }
      ],
      states: {}
    }
  },
  computed: {
    statesVO: function () {
      return Object.entries(this.states)
    }
  },
  methods: {
    addPeer: function () {
      this.peers.push({address: this.peerAddress})
      this.peerAddress = ''
    },
    deletePeer: function (peerToDelete) {
      this.peers = this.peers.filter(peer => peer !== peerToDelete)
    },
    refreshState: function () {
      this.peers.forEach(peer => {
        axios.get(`http://${peer.address}/raft/state`)
          .then(response => {
            // JSON responses are automatically parsed.
            this.states[peer.address] = response.data
            this.$forceUpdate()
            console.log(response.data)
            console.log(Object.entries(this.states))
          })
          .catch(e => {
            console.error(e)
          })
      })
    }
  },
  created () {
    setInterval(() => this.refreshState(), 5000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.peers {
  display: inline-block;
}
.nodes {
  display: inline-block;
}
</style>
