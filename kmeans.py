import numpy as np
import csv
import jieba
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import json
import time

def store(data):
    with open('./out.json', 'w') as json_file:
        json_file.write(json.dumps(data))


def jieba_tokenize(text):
    return jieba.lcut(text)


def getEulerDistancesMatrix(vectors):
    m, n = vectors.shape
    matrix = np.zeros((m, m)) ;
    for i in range(m):
        for j in range(m):
            distance = 0;
            for k in range(n):
                distance += (vectors[i, k] - vectors[j, k]) * (vectors[i, k] - vectors[j, k]);
                distance = np.sqrt(distance);
                matrix[i, j] = matrix[j, i] = distance;
                
    return matrix;


if __name__ == '__main__':
    sourceData = csv.reader(open('./dataset/dataProcessed.csv', encoding='utf-8'))

    textList = []
    length= 0
    for row in sourceData:
        if(length == 0):
            length = 1
        else:
            del row[0]
            del row[3]
            row = str(row).replace(',', ' ')
            textList.append(row)

    tfidf_vectorizer = TfidfVectorizer(tokenizer=jieba_tokenize, lowercase=False)
    tfidf_matrix = tfidf_vectorizer.fit_transform(textList)

    km_cluster = KMeans(n_clusters=3, max_iter=300, n_init=40, init='k-means++', n_jobs=-1)
    result= km_cluster.fit_predict(tfidf_matrix)

    print("calulate distance")
    distance = getEulerDistancesMatrix(tfidf_matrix)
    out = {'matrix': distance.tolist(),
            'result': result.tolist()}
    print(out)
    store(out)


