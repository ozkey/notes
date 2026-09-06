

Data from:
https://www.openbible.info/labs/cross-references/

change the reference panel to use the new data files as per this readme. 
we see the old json as hard to find data as we need to iterate all the file to find the data we need.
we hope new format should make it easier and faster. do not flatten the new json files,
we want to keep the structure of the data as it is in the new format (cross_references_to and cross_references_from).

** DO NOT FLATTEN DATA **
create helper functions to get the data from the new json files. so components can use the new json files to get the data they need.
** DO NOT FLATTEN DATA **
change components to use the new helper functions so that it can be more efficient and easier to find the data we need.
** DO NOT FLATTEN DATA **

this is what the data looks like in the original file:

Gen.1.1	Jer.32.17	90
Gen.1.1	Isa.44.24	97
Gen.1.1	Job.38.4	147
Gen.1.1	Neh.9.6	100
Gen.1.1	Isa.42.5	160
Ps.90.2	Gen.1.1	22
Ps.96.5	Gen.1.1	2

this is what the old json file looks like:

[
    {
        "from": "Gen.1.1",
        "to": "Jer.32.17",
        "votes": 90
    },
    {
        "from": "Gen.1.1",
        "to": "Isa.44.24",
        "votes": 97
    },
]

this is what we want to use in the new json files:

cross_references_to.json
{
    "Gen":{
        "1": {
            "1": [
                {"to": "Jer.32.17", "score": 90},
                {"to": "Isa.44.24", "score": 97},
                {"to": "Job.38.4", "score": 147},
                {"to": "Neh.9.6", "score": 100},
                {"to": "Isa.42.5", "score": 160}
            ]
        }
    }
}  

and cross_references_from.json

{
    "Ps":{
        "90": {
            "2": [
                {"to": "Gen.1.1", "score": 22}
            ]
        },
        "96": {
            "5": [
                {"to": "Gen.1.1", "score": 2}
            ]
        }
    }
}
