import re
import sys

def fix_conflicts(content):
    # Remove conflict markers but keep only the HEAD version
    lines = content.split('\n')
    result = []
    skip = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            skip = False
            continue
        elif line.startswith('======='):
            skip = True
            continue
        elif line.startswith('>>>>>>>'):
            skip = False
            continue
        elif not skip:
            result.append(line)
    
    return '\n'.join(result)

if __name__ == '__main__':
    files = [
        'src/components/admin/CRMModule.tsx',
        'src/pages/SalesDashboard.tsx',
        'src/pages/Index.tsx',
        'src/components/DashboardLayout.tsx',
        'backend/app/utils/database.py',
        'backend/app/routers/sales.py',
        'backend/app/routers/crm.py'
    ]
    
    for file in files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            fixed = fix_conflicts(content)
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(fixed)
            
            print(f'Fixed {file}')
        except Exception as e:
            print(f'Error processing {file}: {e}')

