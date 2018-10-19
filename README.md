# rafting

A playground for implementing [Raft](https://raft.github.io/) – an easy consensus algorithm.

## Theory

* [Raft paper](https://raft.github.io/raft.pdf) – you should read this before diving into code, at
least *chapter 5: The Raft consensus algorithm* (*5.3 Log replication* not required).
* [Raft github site](https://raft.github.io/) – short introduction and an interactive visualization.
* [Raft visualization](http://thesecretlivesofdata.com/raft/) – another visualization,
more guided and less interactive than the one above.

## Contract

A node may be written in any technology as long as it conforms to the contract below:

* The transport protocol is JSON over HTTP.
* Node id is formed by it's IP and port, e.g. `192.168.0.12:5000`.
* TBA: timeouts.

Refer to condensed summary of the Raft algorithm on page 4 of the Raft paper for details on the specific fields and their meaning.

### Request vote

Invoked by candidates to request votes. Corresponds to `RequestVote RPC` from the Raft paper.

Method | Path | Request fields | Response fields
---|---|---|---
`POST` | `/raft/request-vote` | `term`, `candidateId` | `term`, `voteGranted`

Example:
```
$ cat data.json
{
  "term": 1, 
  "candidateId": "192.168.0.12:5000"
}
$ curl -X POST -H Content-Type:application/json -d @data.json localhost:5000/raft/request-vote
{
  "term": 1,
  "voteGranted": true
}
```

### Append entries

Invoked by leader to gather heartbeats. Corresponds to `AppendEntries RPC` from the Raft paper.

In real Raft implementation this is also used to replicate log entries, but we don't cover this feature in this exercise.

Method | Path | Request fields | Response fields
---|---|---|---
`POST` | `/raft/append-entries` | `term` | `term`, `success`

Example:
```
$ cat data.json
{
  "term": 1
}
$ curl -X POST -H Content-Type:application/json -d @data.json localhost:5000/raft/append-entries
{
  "term": 1,
  "success": true
}
```

### State

Invoked by the `rafting-dashboard` to visualize the node state. For diagnostics purposes, not used in the leader election flow.

Method | Path | Response header | Response fields
---|---|---|---
`GET` | `/raft/state` | `Access-Control-Allow-Origin: *` | *described below*

Note the CORS header that the dashboard requires to obtain the results.

Fields:
* `role` (string): the current role: one of `follower`, `candidate` or `leader`.
* `currentTerm` (number): as in Raft paper.
* `lastHeartbeat` (number): last time a request vote or append entries was received, UTC timestamp in milliseconds.
* `peers` (array of strings): node ids of all known nodes, excluding self.
* `nodeId` (string): node id of this node. 
* `votedFor` (string): node id of the last candidate this node voted for.
* `votesGranted` (number): how many votes this node received while being a candidate.

Example:
```
$ curl localhost:5000/raft/state
{
  "currentTerm": 1,
  "lastHeartbeat": 1539944386183,
  "peers": ["192.168.0.44:5000", "192.168.0.33:8080"],
  "role": "candidate",
  "nodeId": "192.168.0.12:5000",
  "votedFor": "192.168.0.44:5000",
  "votesGranted": 2
}
```

## Dashboard

TBA

