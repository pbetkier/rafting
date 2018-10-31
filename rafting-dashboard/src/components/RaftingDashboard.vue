<template>
  <div>
    <h1>Rafting Dashboard</h1>

    <div class="add-peer">
      <input v-model="peer.name" title="peer address" placeholder="Name"/>
      <input v-model="peer.address" title="peer address" placeholder="Address"/>
      <button v-on:click="addPeer()" class="confirm-button">Add peer</button>
    </div>
    or add multiple peers
    <div class="add-peer">
      <textarea v-model="multiplePeers" title="peer address" placeholder="Name and address separated by space. Multiple nodes are separated by newline"></textarea>
      <button v-on:click="addMultiplePeers()" class="confirm-button add-multiple">Add peers</button>
    </div>
    <div class="validation-error" v-show="validationError">
      Invalid format. Name and address should be separated by space.
      Multiple nodes should be separated by new line.
    </div>

    <div v-for="peer in peers" :key="peer.address" class="peer"
         v-bind:class="{ leader: peerRole(peer) === 'leader', follower: peerRole(peer) === 'follower',
                         candidate: peerRole(peer) === 'candidate', error: peerRole(peer) === 'error' }">
        <p class="title">{{peer.name}}</p>
        <button class="title delete-button" v-on:click="deletePeer(peer)">X</button>
        <table v-if="states[peer.address] && states[peer.address] !== 'error'">
          <tr>
            <td class="property">Node ID: </td>
            <td>{{ states[peer.address].nodeId }}</td>
          </tr>
          <tr>
            <td class="property">Role: </td>
            <td>{{ states[peer.address].role }}</td>
          </tr>
          <tr>
            <td class="property">Current Term: </td>
            <td>{{ states[peer.address].currentTerm }}</td>
          </tr>
          <tr>
            <td class="property">Last heartbeat: </td>
            <td>{{ formatDate(states[peer.address].lastHeartbeat) }}</td>
          </tr>
          <tr>
            <td class="property">Peers: </td>
            <td>{{ states[peer.address].peers.join(", ") }}</td>
          </tr>
          <tr>
            <td class="property">Voted for: </td>
            <td>{{ states[peer.address].votedFor }}</td>
          </tr>
          <tr>
            <td class="property">Votes granted: </td>
            <td>{{ states[peer.address].votesGranted }}</td>
          </tr>
        </table>
        <div v-if="states[peer.address] === 'error'" class="no-data">Error while fetching data 😱</div>
        <div v-if="states[peer.address] === undefined" class="no-data">No data yet</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RaftingDashboard',
  data () {
    return {
      peer: {},
      multiplePeers: '',
      peers: [],
      states: {},
      validationError: false
    }
  },
  methods: {
    addPeer: function () {
      this.peers.push(this.peer)
      this.peer = {}
      this.refreshState()
    },
    addMultiplePeers: function () {
      this.multiplePeers.split('\n').forEach((line) => {
        let nameWithAddress = line.split(' ')
        if (nameWithAddress.length !== 2) {
          this.validationError = true
          throw new Error(line + ' has invalid format. The correct format is name separated with address')
        }
        this.peers.push({name: nameWithAddress[0], address: nameWithAddress[1]})
        this.multiplePeers = ''
        this.validationError = false
      })
    },
    deletePeer: function (peerToDelete) {
      this.peers = this.peers.filter(peer => peer !== peerToDelete)
    },
    refreshState: function () {
      this.peers.forEach(peer => {
        axios.get(`http://${peer.address}/raft/state`, {timeout: 1000})
          .then(response => {
            this.states[peer.address] = response.data
            this.$forceUpdate()
            console.log(response.data)
          })
          .catch(e => {
            this.states[peer.address] = 'error'
            this.$forceUpdate()
            console.error(e)
          })
      })
    },
    formatDate: function (timestamp) {
      return new Date(timestamp).toLocaleString()
    },
    peerRole: function (peer) {
      let state = this.states[peer.address]
      if (state && state !== 'error') {
        return state.role
      }
      return 'error'
    }
  },
  created () {
    setInterval(() => this.refreshState(), 1000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
.peer {
  vertical-align: top;
  display: inline-block;
  width: 350px;

  text-align: left;
  background: #C9A6A3;
  color: #474747;
  margin: 8px;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
}

.peer > .title {
  display: inline-block;
}
.property {
  font-weight: bold;
  padding-right: 8px;
  width: 130px;
  vertical-align: top;
}

input {
  font-size: 16px;
  padding: 8px;
  border: black;
  border-radius: 2px;
  width: 200px;
}

.confirm-button {
  background-color: #087E8B;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 16px;
  padding: 8px;
  size: 24px;
  vertical-align: top;
}

.add-peer {
  margin: 16px;
}

.add-peer textarea {
  font-size: 16px;
  padding: 8px;
  border-width: 0;
  border-radius: 2px;
  width: 420px;
  height: 60px;
  margin-left: 6px;
}

.validation-error {
  color: #FF706D
}

.peer p {
  font-size: 24px;
  font-weight: bold;
  margin: 8px;
  padding-bottom: 8px;
}

.delete-button {
  float: right;
  margin: 8px;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  border: 1px solid #474747;
  padding: 4px;
  font-size: 16px;
  font-weight: bold;
  color: #474747;
  background: none;
  box-sizing:content-box;
}

.no-data {
  text-align: center;
  font-size: 16px;
  padding: 32px;
}

.leader {
  background: #53EF8F;
}

.candidate {
  background: #68D4FF;
}

.follower {
  background: #C9A6A3;
}

.error {
  background: #FF706D;
}
</style>
