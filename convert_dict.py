import csv
import json
import re

# 配置：您想要多少个单词？
MAX_WORDS = 30000 

# 输入文件 (从 ECDICT 下载的 csv)
INPUT_FILE = 'ecdict.csv'
# 输出文件
OUTPUT_FILE = 'dictionary_full.json'

def clean_meaning(meaning_str):
    """清洗释义，只保留最核心的中文意思"""
    if not meaning_str:
        return ""
    # 移除换行符，只取第一行
    first_line = meaning_str.split('\\n')[0]
    return first_line

def convert():
    print(f"正在读取 {INPUT_FILE} ...")
    
    words_list = []
    
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                word = row.get('word')
                phonetic = row.get('phonetic')
                translation = row.get('translation')
                
                # 过滤条件：
                # 1. 必须有单词、音标和翻译
                # 2. 单词里不能包含空格（排除词组，只留单词，如果您想要词组可以去掉这个判断）
                if word and phonetic and translation and ' ' not in word:
                    
                    # 格式化音标：加上 //
                    formatted_ipa = f"/{phonetic}/"
                    
                    # 格式化释义
                    clean_trans = clean_meaning(translation)
                    
                    word_obj = {
                        "word": word,
                        "ipa": formatted_ipa,
                        "meaning": clean_trans
                    }
                    
                    words_list.append(word_obj)
                    
                    if len(words_list) >= MAX_WORDS:
                        break
                        
        print(f"提取完成，共 {len(words_list)} 个单词。正在写入 JSON...")
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
            json.dump(words_list, f_out, ensure_ascii=False, indent=2)
            
        print(f"成功！文件已保存为: {OUTPUT_FILE}")
        print("请将此文件放入您的 React 项目 src 文件夹中并在 App.jsx 中引用。")

    except FileNotFoundError:
        print(f"错误：找不到文件 {INPUT_FILE}")
        print("请先去 https://github.com/skywind3000/ECDICT 下载 ecdict.csv")

if __name__ == "__main__":
    convert()