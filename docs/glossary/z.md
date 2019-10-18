---
id: z
title: Z
sidebar_label: Z
---

## Zones
A Zone represents the file system used in a standalone Hadoop cluster. Multiple Zones could be from separate clusters in the same data center, or could be from distinct clusters operating in geographically-separate data centers that span the globe. WANdisco Fusion operates as a distributed collection of servers. While each WANdisco Fusion server always belongs to only one Zone, a Zone can have multiple WANdisco Fusion servers (for load balancing and high availability). When you install WANdisco Fusion, you should create a Zone for each cluster’s file system.
