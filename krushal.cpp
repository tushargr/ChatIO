#include <bits/stdc++.h>
#include<vector>
using namespace std;
vector <pair<int,int>> mpq;

void minheapify(int node){
    int minimum=node;
    if((2*node+1<mpq.size())&&(mpq[node].second>mpq[2*node+1])) minimum=2*node+1;

    if((2*node+2<mpq.size())&&(mpq[minimum].second>mpq[2*node+2])) minimum=2*node+2;

    if(minimum!=node){
        pair<int ,int>p;
        p.first=mpq[minimum].first;
        p.second=mpq[minimum].second;
        mpq[minimum].first=mpq[node].first;
        mpq[minimum].second=mpq[node].second;
        mpq[node].first=p.first;
        mpq[node].second=p.second;
        minheapify(minimum);
    }
    return;
}
void remove_top(){
    if(mpq.size()<=2){
        mpq.erase(mpq.begin());
    }
    else{
        pair<int ,int>p;
        p.first=mpq[0].first;
        p.second=mpq[0].second;
        mpq[0].first=mpq[mpq.size()-1].first;
        mpq[0].second=mpq[mpq.size()-1].second;
        mpq[mpq.size()-1].first=p.first;
        mpq[mpq.size()-1].second=p.second;
        mpq.erase(mpq.begin()+mpq.size()-1);
        minheapify(0);
    }
    return;
}
void insert(pair<int,int>p){
    if(mpq.size()==0){
        mpq.push_back(p);
        return;
    }
    else{
        mpq.push_back(p);
        for(int i=mpq.size()-1;i>0;i=(i-1)/2){
            if(mpq[i].second<mpq[(i-1)/2].second){
                pair<int ,int>p;
                p.first=mpq[i].first;
                p.second=mpq[i].second;
                mpq[i].first=mpq[(i-1)/2].first;
                mpq[i].second=mpq[(i-1)/2].second;
                mpq[(i-1)/2].first=p.first;
                mpq[(i-1)/2].second=p.second;
            }
            else{
                break;
            }
        }
        return;
    }
    return;
}


int main() {
    int t;
    cin >> t;
    while(t--){
        int n,m;
        cin>>n>>m;
        vector <pair<int,int>> adjlist[n];  
        
        for(int i=0;i<m;i++){
            int a,b,w;
            cin>>a>>b>>w;
            a--;b--;
            adjlist[a].push_back(make_pair(b,w));
            adjlist[b].push_back(make_pair(a,w));
        }
        int start_node;
        cin>>start_node;
        int dist[n];
        for(int i=0;i<n;i++){
            dist[i]=1000000000;
        }
        dist[start_node]=0;
        insert(make_pair(start_node,0));          //insert into min priority queue
        while(!mpq.empty()){
            pair <int,int> p=mpq[0];
            remove_top();
            int node=p.first;
            for(int i=0;i<adjlist[start_node].size();i++){
                int next_node=adjlist[start_node][i].first;
                int w=adjlist[start_node][i].second;

                if(dist[next_node]>dist[node]+w){
                    dist[next_node]=dist[node]+w;
                    insert(make_pair(next_node,dist[next_node]));
                }
            }

        }


    }
    return 0;
}
